#!/bin/sh

# Ir al directorio de trabajo
cd /app

# Crear la carpeta uploads
mkdir uploads

# Dar permisos a la carpeta uploads
chmod -R 775 uploads

#PERMISOS A LA CARPETA: New-Item -ItemType Directory -Force -Path "./uploads" | Set-Acl -aclobject $(Get-Acl .)| %{$_.SetAccessRuleProtection($false)} ; Get-ChildItem -Path .\uploads -Recurse| where {$_.PSIsContainer}|%{(gi $_.FullName).setaccessruleprotection($False,$True)}