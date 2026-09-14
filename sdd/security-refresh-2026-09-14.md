# Security Runtime Refresh

Decision: Go 1.26.8 target; k6 2.2.0 is rebuilt from checksum-verified module source with Go 1.26.8, x/crypto 0.57.0 and gRPC 1.83.2. The upstream image alone still contained vulnerable Go and gRPC code. Its license is retained and Alpine packages are upgraded. The downstream build is not the official upstream binary.

The existing benchmark JSON is historical evidence for its recorded source commit and image digest. It is preserved byte-for-byte, is not a measurement of the refreshed runtime, and must not block security upgrades. A new publication needs a clean source commit, new image identity, and new benchmark evidence; do not overwrite the old result or claim comparability without remeasurement.

Old untracked .portfolio-control/security reports are retained as historical scans, not current-source attestation. Fresh review outputs and residual findings are recorded in the parent go-security-handoff.md. No commit or push is performed by this reviewer.

Version sources: https://go.dev/dl/?mode=json, https://proxy.golang.org/, upstream GitHub releases, and the Terraform registry where applicable.
