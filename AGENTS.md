# Repository Guidelines

## Project Structure & Module Organization
Keep the root lean (`README.md`, `AGENTS.md`, configuration). Store briefs and diagrams in `docs/`—the supplied PDF is the project charter. Add implementation packages under `src/` (create if missing) grouped by domain, and mirror them in `tests/` for parity. Place sample datasets or fixtures in `data/` and trim anything above 5 MB before committing.

## Build, Test, and Development Commands
Use a virtual environment: `python -m venv .venv && source .venv/bin/activate`. Once requirements exist, install them with `pip install -r requirements.txt`. Expose common workflows through a `Makefile`: `make lint` (runs `black`, `isort`, `flake8`), `make test` (`pytest --cov=src`), and `make run` (entry point for the demo or CLI script). Document any additional ingestion commands in `README.md` so new contributors can reproduce them.

## Coding Style & Naming Conventions
Target Python 3.11+. Format code with `black` (line length 88) and manage imports with `isort`. Apply `flake8` and `mypy` before opening a PR. Follow snake_case for modules, functions, and variables; PascalCase for classes; uppercase snake case for constants and environment keys. Record shared configuration in `.env` and provide `.env.example` with safe defaults.

## Testing Guidelines
Write tests with `pytest`; name files `test_<module>.py` and keep fixtures in `tests/fixtures/`. Cover CRUD workflows across the NoSQL modules and add regression tests for reported issues. Target ≥85% statement coverage using `pytest --cov=src --cov-report=term-missing`. Mark long-running or external checks with `@pytest.mark.integration` and gate them behind `INTEGRATION_TESTS=1`.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`) to keep history searchable. Limit commits to one logical change and explain the “why” in the body while referencing issue IDs. Pull requests should outline the problem, solution, and validation steps; attach screenshots or logs for user-facing updates, ensure `make lint` and `make test` pass, and request at least one reviewer.

## Security & Configuration Tips
Never commit real credentials. Rely on `.env` for secrets and document required variables in `.env.example`. If external NoSQL clusters are involved, capture access rules in `docs/security.md` and coordinate firewall updates before merging.
