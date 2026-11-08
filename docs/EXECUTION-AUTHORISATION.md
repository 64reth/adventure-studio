# ADVENTURE STUDIO — EXECUTION AUTHORISATION

The project owner has granted full development and deployment permission for Adventure Studio. This instruction supersedes earlier deployment and push restrictions in the Codex brief.

Project directory: `/Users/garethwallen/Projects/adventure-studio`
GitHub: https://github.com/64reth/adventure-studio

## Authorised actions
- Implement Builds 001–005 autonomously.
- Install necessary project dependencies; create and modify project files.
- Run local development servers, builds and tests; generate and validate puzzle assets.
- Create and manage project-specific databases, storage and Cloudflare resources.
- Commit and push completed milestones to GitHub.
- Deploy to Cloudflare using the existing authenticated CLI.
- Verify live deployments, correct defects and continue until acceptance criteria are met or a genuine external blocker is encountered.

## Deployment requirements
Use a dedicated Worker and project-specific resources. Prefer the non-conflicting staging name `adventure-studio-staging`. Deploy to staging first and verify puzzles, persistence, exports and production workflows. Do not change unrelated DNS or assume approval of a production custom domain.

## Operational boundaries
Work exclusively within Adventure Studio and its dedicated resources. Do not alter Story Book Builder or other Allen Creative Technologies applications. Never expose credentials, commit secrets, initiate paid AI generation, purchase services, force-push or destructively reset work. Preserve repository history and unrelated Cloudflare resources.

## Completion requirements
For each build, implement, test, commit and push the completed milestone. Verify the deployed application live. Report functionality and limitations, commit hashes and push status, staging URL and deployment identifier, automated tests, the five-page playable prototype and answer keys, print PDF results, and remaining configuration requirements.

Begin implementation immediately and continue autonomously through the full build plan. The first major review is the actual five-page adventure, puzzles, artwork, difficulty, layout and print output before scaling to full books. Development authorisation does not constitute human page or artwork publication approval.
