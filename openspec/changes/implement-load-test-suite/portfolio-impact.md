# Portfolio Impact

## Program

- Program: `delivery-observability-infra`.
- Related repositories: `ci-cd-templates`, `observability-stack`, `terraform-aws-baseline`.
- Shared assets: GitHub Actions, k6 load profiles, benchmark JSON, and release gates.

## System Story

This repository provides the load evidence that would otherwise be missing
between delivery templates and observability. It creates a common path to
measure tail latency, record the environment, and compare changes without
depending on the cloud.

## Proficiency Signal

- Primary skill: Go HTTP and k6.
- Secondary skills: Docker, CI, and contract validation.
- Recruiter-facing proof: a p95 benchmark with a curve per VU level, a pinned image, and a versioned result.

## Post Angle

How to turn a small HTTP target into reproducible operational evidence with
k6, Docker, and CI.
