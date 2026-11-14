# Deploy prompt for OpenClaw

Copy everything between the lines into OpenClaw. Fill in the three `<...>` values first.

---

Deploy a static website to my Rocky Linux server running Apache (httpd).

Values:
- Domain or subdomain for the site: `<oceanofstorms.example.com>`
- Source: the `web/` folder of the git repository `<https://github.com/apn201/Myrsky.git>` (branch `main`). If the repository is not reachable, I will upload `web.tar.gz` to `/tmp/web.tar.gz` instead; unpack that.
- Document root to use: `/var/www/oceanofstorms`

Steps:
1. Check that httpd is installed and running (`systemctl status httpd`). Do not change or restart any other site's configuration beyond what is below. Show me the existing `/etc/httpd/conf.d/*.conf` file names before adding a new one.
2. Fetch the site: `git clone --depth 1 <repo> /tmp/oos && rsync -a --delete /tmp/oos/web/ /var/www/oceanofstorms/` (or unpack the tarball so that `index.html` ends up directly in `/var/www/oceanofstorms/`). The site is plain static files: no build step, no PHP, no database.
3. Ownership and SELinux: `chown -R root:root /var/www/oceanofstorms`, files 644, folders 755, then `restorecon -Rv /var/www/oceanofstorms`.
4. Create `/etc/httpd/conf.d/oceanofstorms.conf`:
   ```apache
   <VirtualHost *:80>
     ServerName <oceanofstorms.example.com>
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
   The site ships its own `.htaccess` with MIME types (`.wasm` application/wasm, `.glb` model/gltf-binary, `.i16` application/octet-stream), compression and cache headers. Make sure `mod_mime`, `mod_deflate` and `mod_headers` are loaded (`httpd -M`).
5. `apachectl configtest`, then `systemctl reload httpd`.
6. HTTPS: if certbot is installed, run `certbot --apache -d <oceanofstorms.example.com>` and accept the redirect to HTTPS. If not, tell me and stop; do not install new packages without asking.
7. Firewall: check `firewall-cmd --list-services` includes http and https. If not, ask me before changing it.
8. Verify from the server:
   - `curl -sI https://<domain>/` returns 200 and `text/html`
   - `curl -sI https://<domain>/vendor/draco/draco_decoder.wasm` returns `application/wasm`
   - `curl -sI https://<domain>/assets/terrain_1024.i16` returns 200 (about 2 MB)
   - `curl -sI https://<domain>/assets/lm_nasa.glb` returns 200
   - `curl -s https://<domain>/info.html | grep -c "THERE IS NO CAMERA"` prints 1
9. Report back: the final URL, the vhost file path, and the output of the checks.

The site must be reachable without login: NASA Space Apps judges will open it. Do not add basic auth or IP restrictions.

---

## Making the tarball locally (if the repo is not public yet)

```bash
tar -czf web.tar.gz -C web .
```

Then upload `web.tar.gz` to the server's `/tmp/`.

## Updating later

Re-run step 2 and step 3. No reload is needed for content changes.
