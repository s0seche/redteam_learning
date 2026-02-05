
# Clause de Responsabilité

Les informations présentées ci-dessous sont fournies **uniquement à des fins éducatives, de recherche ou de laboratoire**.  
Toute expérimentation doit être réalisée **dans un environnement contrôlé**, avec les **autorisations nécessaires** et dans le respect des lois et réglementations en vigueur.  
L’utilisation de ces connaissances en dehors d’un cadre légal ou autorisé est strictement interdite.

---

# Objectif

Ce document a pour objectif de **tester l'outil "Rubber Ducky"** et de montrer la création et l'utilisation de scripts pour cet outil.  

**Rubber Ducky (USB)** : c’est un outil de sécurité / hacking ressemblant à une clé USB qui, lorsqu’on la branche, peut exécuter automatiquement des commandes stockées sur une carte SD, souvent à des fins de test ou de démonstration.

---

# Scripts

| Nom du script       | Statut        | Description                                                                 | OS cible   |
|--------------------|--------------|----------------------------------------------------------------------------|-----------|
| `dl_payload.bin`    | ✅   | Télécharge un payload hébergé sur un serveur externe et tente de l’exécuter | Windows 11 |
| `exfil_file.bin`    | ✅   | Exfiltre les fichiers d’un dossier spécifique vers une partition de la carte SD | Windows 11 |
| `exfilt_SAM.bin`    | ✅   | Exfiltre la base SAM                                                      | Windows   |
| `shutmac.bin`       | ✅ | Éteint un  Mac                                                            | macOS     |
| `shutwin.bin`       | ✅   | Éteint le PC                                                              | Windows 11 |
| `test_PS.bin`       | ✅   | Exécute une commande PowerShell (test )                               | Windows 11 |
| `up_led.bin`        | ✅   | Allume une LED (test)                                                     | Tous      |



