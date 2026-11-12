# Releases

One row per release. The version is the major number in `package.json`; it is also the Docker image tag (`docker.io/rnair86/portfolio:<version>`) and the git tag (`v<version>`). `scripts/release.ps1` appends rows here.

To roll back, point Azure at an earlier tag (see `Deployment.md`). To see what code a version contains: `git show v<version>`.

| Version | Date | Commit | Image digest | Azure revision | Summary |
| --- | --- | --- | --- | --- | --- |
| 1 | — | none (predates git) | — | `nair-portfolio--0000002` | First deployment |
| 2 | 2026-11-11 | `484a737` | `sha256:864f62120ce9f99fa1407d123c1d83d1546946d8b22716a04c0e4dba745de2c9` | `nair-portfolio--0000003` | Resume-sourced profile, GitHub link |
