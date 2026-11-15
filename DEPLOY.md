# Deploy prompt for OpenClaw (Helppox, Rocky Linux + Apache)

Test copy (GitHub Pages, updated from the `gh-pages` branch): https://apn201.github.io/Myrsky/

Copy everything between the two lines into OpenClaw. Replace `oceanofstorms.example.com` with the real domain or subdomain first (four places). The domain's DNS A/AAAA record must already point to Helppox.

---

Deploy a static website to my Rocky Linux server (Helppox), which runs Apache (httpd).

Values:
- Domain: `oceanofstorms.example.com`
- Source: the `web/` folder of the public git repository `https://github.com/apn201/Myrsky.git`, branch `main`
- Document root: `/var/www/oceanofstorms`

Rules:
- Do not change, disable or restart any other site. Use `systemctl reload httpd`, never restart.
- Do not install packages, open firewall ports or change SELinux policy without asking me first.
- Stop and report if any step fails.

Steps:
1. Look first, change nothing: show the output of `cat /etc/rocky-release`, `systemctl is-active httpd`, `ls /etc/httpd/conf.d/`, `httpd -M | grep -E "mime|deflate|headers|ssl|rewrite"`, `which git rsync certbot`, and `ls -la /var/www/oceanofstorms` (it should not exist yet; if it exists, ask me before overwriting).
2. Fetch the site (plain static files: no build step, no PHP, no database):
   ```bash
   rm -rf /tmp/oos && git clone --depth 1 https://github.com/apn201/Myrsky.git /tmp/oos
   mkdir -p /var/www/oceanofstorms
   rsync -a --delete /tmp/oos/web/ /var/www/oceanofstorms/
   ```
   If rsync is missing, use `cp -a /tmp/oos/web/. /var/www/oceanofstorms/`. `index.html` and `.htaccess` must end up directly in `/var/www/oceanofstorms/`.
3. Permissions and SELinux:
   ```bash
   chown -R root:root /var/www/oceanofstorms
   find /var/www/oceanofstorms -type d -exec chmod 755 {} +
   find /var/www/oceanofstorms -type f -exec chmod 644 {} +
   restorecon -Rv /var/www/oceanofstorms
   ```
4. Create `/etc/httpd/conf.d/oceanofstorms.conf`:
   ```apache
   <VirtualHost *:80>
     ServerName oceanofstorms.example.com
     DocumentRoot /var/www/oceanofstorms
     <Directory /var/www/oceanofstorms>
       Options -Indexes
       AllowOverride FileInfo Indexes Options
       Require all granted
     </Directory>
     ErrorLog /var/log/httpd/oceanofstorms_error.log
     CustomLog /var/log/httpd/oceanofstorms_access.log combined
   </VirtualHost>
   ```
   The site's own `.htaccess` sets the MIME types (`.wasm` application/wasm, `.glb` model/gltf-binary, `.i16` application/octet-stream), compression and cache headers. It needs `mod_mime`, `mod_deflate` and `mod_headers`; these are on by default in Rocky's httpd. If one is missing, tell me.
5. `apachectl configtest`. Only if it says `Syntax OK`: `systemctl reload httpd`.
6. HTTPS: if certbot is installed, run `certbot --apache -d oceanofstorms.example.com --redirect`. If certbot is not installed, tell me and stop here; do not install it without asking.
7. Firewall: show `firewall-cmd --list-services`. If http or https is missing, ask me before adding it.
8. Check from the server (use https if step 6 worked, else http):
   - `curl -sI https://oceanofstorms.example.com/` → 200, `text/html`
   - `curl -sI https://oceanofstorms.example.com/vendor/draco/draco_decoder.wasm` → 200, `application/wasm`
   - `curl -sI https://oceanofstorms.example.com/assets/terrain_1024.i16` → 200
   - `curl -sI https://oceanofstorms.example.com/assets/lm_nasa.glb` → 200, `model/gltf-binary`
   - `curl -sI https://oceanofstorms.example.com/assets/` → 403 (no directory listing)
   - `curl -s https://oceanofstorms.example.com/info.html | grep -c "THERE IS NO CAMERA"` → 1
9. Create `/usr/local/bin/oos-update` so I can update the site later with one command:
   ```bash
   #!/bin/bash
   set -e
   rm -rf /tmp/oos && git clone --depth 1 https://github.com/apn201/Myrsky.git /tmp/oos
   rsync -a --delete /tmp/oos/web/ /var/www/oceanofstorms/
   chown -R root:root /var/www/oceanofstorms
   find /var/www/oceanofstorms -type d -exec chmod 755 {} +
   find /var/www/oceanofstorms -type f -exec chmod 644 {} +
   restorecon -R /var/www/oceanofstorms
   echo "Updated to $(git -C /tmp/oos log -1 --format='%h %s')"
   ```
   `chmod 755 /usr/local/bin/oos-update`. Do not schedule it; I will run it by hand.
10. Report back: the final URL, the vhost file path, whether HTTPS works, and the output of the checks in step 8.

The site must be open to everyone without a login: NASA Space Apps judges will open it. Do not add basic auth, IP restrictions or a robots block.

---

## If GitHub is not reachable from the server

Build the tarball locally and upload it to `/tmp/web.tar.gz`:

```bash
tar -czf web.tar.gz -C web .
```

Then, in step 2, use `mkdir -p /var/www/oceanofstorms && tar -xzf /tmp/web.tar.gz -C /var/www/oceanofstorms` instead of the git clone.

## Updating later

Push to `main`, then on the server run `oos-update`. No reload is needed for content changes.

To refresh the GitHub Pages test copy as well:

```bash
git subtree split --prefix web -b gh-pages && git push -f origin gh-pages
```
