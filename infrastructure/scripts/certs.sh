#!/bin/sh

echo "Enter password for private key:"
stty -echo
read PASSWORD
stty echo
echo

openssl req -subj '/CN=Azure/O=Tobias Kärst Software/C=DE' -new -newkey rsa:4096 -sha256 -days 730 -nodes -x509 -keyout client.key -out client.crt
openssl pkcs12 -export -password pass:$PASSWORD -out client.pfx -inkey client.key -in client.crt
base64 -w 0 client.pfx > base64_pfx.txt

echo "Certificate and key have been generated."
