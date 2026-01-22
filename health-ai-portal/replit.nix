{ pkgs }: {
  deps = [
    pkgs.go_1_22
    pkgs.gopls
    pkgs.gotools
    pkgs.go-tools
    pkgs.nodejs_20
    pkgs.nodePackages.typescript
    pkgs.nodePackages.typescript-language-server
  ];
}
