# DirtyFrag

**CVE-2026-43284** (xfrm-ESP) · **CVE-2026-43500** (RxRPC)  
Local Privilege Escalation — noyau Linux ≥ 4.14

> ⚠️ À des fins éducatives uniquement. Usage autorisé uniquement.

---

## Comment ça fonctionne

DirtyFrag chaîne deux bugs dans le noyau Linux. Le premier (`esp4`/`esp6`) permet à un processus non privilégié d'écrire dans le page-cache du noyau via le chemin de déchiffrement IPsec. Le second (`rxrpc`) fait la même chose sans nécessiter de namespace. Combinés, ils permettent d'écraser des fichiers système en lecture seule (comme `/etc/passwd` ou un binaire setuid) et d'obtenir un shell root — de manière déterministe, sans race condition, sans crash noyau.

**Persistance** : l'exploit corrompt le page-cache de façon permanente jusqu'au prochain reboot. Il suffit de quitter le shell root et de retaper `su` pour revenir root immédiatement, sans relancer l'exploit.

---

## OS affectés

Tout système avec un noyau entre **4.14 (jan. 2017)** et **mai 2026** non patché.

| Distribution | Versions affectées |
|---|---|
| Debian | 9 (Stretch) → 12 (Bookworm) |
| Ubuntu | 17.10 → 24.04 |
| RHEL / AlmaLinux / CentOS | 7 → 10 |
| Fedora | toutes versions récentes |
| Arch Linux | toutes versions récentes |

---

## Utilisation

```bash
git clone https://github.com/s0seche/redteam_learning.git
cd poc_cve
chmod +x exploit
./exploit
# id
uid=0(root) gid=0(root) groups=0(root)

# Quitter puis revenir root sans relancer l'exploit :
exit
su
# id
uid=0(root) gid=0(root) groups=0(root)
```

> Après exploitation, purger le page-cache pour stabiliser le système :
> ```bash
> echo 3 > /proc/sys/vm/drop_caches
> ```

---

## Protection

**Pas de patch Debian disponible au moment de la rédaction**.

---

## Références

- [Write-up & PoC — @v4bel](https://x.com/v4bel)
