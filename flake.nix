{
  description = "pzprjs";

  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.nixpkgs.url = github:NixOS/nixpkgs/nixos-22.05;
  inputs.npmlock2nix-repo = {
    url = "github:tweag/npmlock2nix";
    flake = false;
  };

  outputs = {
    self,
    flake-utils,
    nixpkgs,
    npmlock2nix-repo,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        defaultPackage = pkgs.callPackage ./nix/pzprjs.nix {
          git-hash = if self ? rev then self.rev else "dirty";
          npmlock2nix = import npmlock2nix-repo {inherit pkgs;};
        };
      }
    );
}
