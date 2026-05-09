# Build resources

Drop installer assets here:

- `icon.ico` — Windows app icon (256x256 multi-resolution; electron-builder picks
  this up automatically and bakes it into the NSIS installer and the
  packaged .exe).
- `installerIcon.ico` / `uninstallerIcon.ico` — optional NSIS-specific
  icons; otherwise NSIS reuses `icon.ico`.
- `installerHeader.bmp` (150x57) and `installerSidebar.bmp` (164x314) —
  optional NSIS installer artwork.

Until the icon lands, electron-builder uses Electron's default icon. The
rest of the installer metadata (product name, copyright, installer
filename, start-menu and desktop shortcuts) is configured in
`electron-builder.yml`.
