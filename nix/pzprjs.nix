{
  git-hash,
  pkgs,
  stdenv,
  nodejs,
  npmlock2nix,
  esbuild,
}: let
  node_modules = npmlock2nix.node_modules {
    src = ../.;
  };
in
  stdenv.mkDerivation {
    name = "pzprjs";
    src = ../.;

    outputs = ["out" "dev"];

    buildInputs = [nodejs];

    configurePhase = ''
      # Get the node_modules from its own derivation
      ln -sf ${node_modules}/node_modules node_modules
      export HOME=$TMP
      export GIT_HASH=${git-hash}
    '';

    buildPhase = ''
      npm run-script build
    '';

    installPhase = ''
      mkdir $out
      cp index.js $out/
      cp package.json $out/
      cp package-lock.json $out/
      cp -r dist/ $out/dist

      # Remove all the sourcemaps from $out
      # find $out -name "*.js.map" -delete

      # For dev, keep all the outputs, including the sourcemaps
      cp -r dist/ $dev/
    '';
  }
