# SBPBS — Smart Building Planning and Blueprint Suggestion System

Academic prototype with the existing dark-galaxy HTML/CSS/JavaScript frontend, Java 17 + Spring Boot REST API, and MySQL persistence.

## Features
- Multi-step plot/site/building/preferences form, SVG preliminary plan, dashboard, and recommendations (existing frontend logic).
- Spring Boot REST endpoints: `GET /api/health`, `POST /api/analyze`, `GET /api/projects`, `POST /api/projects`, `DELETE /api/projects/{id}`.
- Project metadata and full analysis JSON are persisted in MySQL; frontend project list uses the API when the backend is running.
- Frontend falls back to local browser storage if the API is unavailable. A toast warns that this is local-only.

## Run on macOS
1. Install Java 17 and Maven, and install/start MySQL.
2. Create the database: run `mysql -u root -p < database/schema.sql` (or let Hibernate create it if the DB user has permission).
3. Set environment variables in Terminal (recommended):
   ```bash
   export SBPBS_DB_USER=root
   export SBPBS_DB_PASSWORD='YOUR_MYSQL_PASSWORD'
   ```
4. From this folder run:
   ```bash
   mvn spring-boot:run
   ```
5. Open **http://localhost:8080**. Do not open `index.html` directly with `file://` if you want API persistence.
6. Verify **http://localhost:8080/api/health** returns status UP.
7. Generate a plan, then click **Save Project to MySQL** below the blueprint. The Save Draft button only stores the in-progress form in browser storage. Check saved rows with `SELECT id, project_name, owner, area, created_at FROM projects;`.

## API smoke tests
```bash
curl http://localhost:8080/api/health
curl -X POST http://localhost:8080/api/analyze -H 'Content-Type: application/json' -d '{"length":60,"width":40,"unit":"ft","floors":2,"style":"Modern","soil":"Loamy","slope":"Flat","road":"Available","water":"Available"}'
curl http://localhost:8080/api/projects
```

## Important notes
- This package has not been run against your Mac/MySQL credentials from this environment. Run the steps above and verify the health endpoint and database insert before claiming a successful live integration.
- The API analysis endpoint uses transparent preliminary rules. The current rich SVG/dashboard rendering remains in the provided frontend JavaScript. This is not a structural engineering or permit-ready drawing system.
- Authentication markup in the supplied frontend is a UI prototype; production authentication and authorization are not implemented. Do not store sensitive data or expose the app publicly as-is.


## Analysis and conceptual blueprint APIs

- `GET /api/health` — lightweight application health response.
- `POST /api/analyze` — validates positive plot dimensions and supported units (`ft` or `m`), then returns preliminary area, coverage assumption, cost estimate and site recommendations.
- `POST /api/blueprint` — returns a conceptual room-grid layout based on plot proportions, bedroom/bathroom counts and optional parking.

Example analysis request:

```json
{
  "length": 40,
  "width": 30,
  "unit": "ft",
  "floors": 2,
  "beds": 3,
  "baths": 2,
  "style": "Modern",
  "parking": "Required",
  "soil": "Loamy",
  "slope": "Flat"
}
```

The 75% coverage and style-based cost rates are prototype assumptions. The generated room grid is an academic visualization only; it does not check local planning rules, minimum room dimensions, setbacks, structure, circulation, fire safety, accessibility compliance or site-specific conditions. Do not use it as a construction drawing. Obtain approval and design from qualified local professionals.

## Configuration and database safety

Configure `SBPBS_DB_URL`, `SBPBS_DB_USER`, and `SBPBS_DB_PASSWORD` as environment variables on the machine running the application. Do not commit actual credentials to source control. Existing project persistence remains handled by Spring Data JPA and the configured MySQL database.
