# Spring Boot Backend API Specification

> Complete specification for implementing the CSE Department Events backend in Java Spring Boot.

## Project Setup

### Maven Configuration (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <groupId>edu.cse</groupId>
    <artifactId>csedepartment-events</artifactId>
    <version>1.0.0</version>
    <name>CSE Department Events</name>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <!-- Database -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- CSV Export -->
        <dependency>
            <groupId>com.opencsv</groupId>
            <artifactId>opencsv</artifactId>
            <version>5.8</version>
        </dependency>
        
        <!-- Utilities -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### Directory Structure

```
src/main/java/edu/cse/events/
├── CseDepartmentEventsApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── JwtConfig.java
├── controller/
│   ├── EventController.java
│   ├── RegistrationController.java
│   └── AuthController.java
├── dto/
│   ├── EventDto.java
│   ├── EventCreateRequest.java
│   ├── RegistrationDto.java
│   ├── RegistrationCreateRequest.java
│   ├── LoginRequest.java
│   └── AuthResponse.java
├── entity/
│   ├── Event.java
│   └── Registration.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── RegistrationClosedException.java
│   └── DeadlinePassedException.java
├── repository/
│   ├── EventRepository.java
│   └── RegistrationRepository.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── AdminUserDetails.java
└── service/
    ├── EventService.java
    ├── RegistrationService.java
    └── CsvExportService.java

src/main/resources/
├── application.yml
├── application-dev.yml
├── application-prod.yml
└── db/migration/
    ├── V1__init_schema.sql
    └── V2__seed_data.sql
```

---

## Entity Classes

### Event.java

```java
package edu.cse.events.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "event_type", nullable = false)
    private String eventType;
    
    @Column(name = "event_date", nullable = false)
    private OffsetDateTime eventDate;
    
    @Column(name = "registration_deadline", nullable = false)
    private OffsetDateTime registrationDeadline;
    
    private String venue;
    
    @Column(name = "max_participants")
    private Integer maxParticipants;
    
    @Column(name = "registration_open", nullable = false)
    private Boolean registrationOpen = true;
    
    @Column(name = "poster_url")
    private String posterUrl;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Registration> registrations;
    
    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
```

### Registration.java

```java
package edu.cse.events.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "registrations", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "student_email"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    
    @Column(name = "student_name", nullable = false)
    private String studentName;
    
    @Column(name = "student_email", nullable = false)
    private String studentEmail;
    
    @Column(name = "student_roll_number", nullable = false)
    private String studentRollNumber;
    
    @Column(name = "student_phone")
    private String studentPhone;
    
    private String department;
    
    @Column(name = "year_of_study")
    private String yearOfStudy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
```

---

## DTOs

### EventCreateRequest.java

```java
package edu.cse.events.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventCreateRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200)
    private String title;
    
    @Size(max = 2000)
    private String description;
    
    @NotBlank(message = "Event type is required")
    @Pattern(regexp = "symposium|workshop|contest|seminar|hackathon|other")
    private String eventType;
    
    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private OffsetDateTime eventDate;
    
    @NotNull(message = "Registration deadline is required")
    @Future(message = "Registration deadline must be in the future")
    private OffsetDateTime registrationDeadline;
    
    @Size(max = 200)
    private String venue;
    
    @Min(1)
    private Integer maxParticipants;
    
    private Boolean registrationOpen = true;
    
    private String posterUrl;
}
```

### RegistrationCreateRequest.java

```java
package edu.cse.events.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationCreateRequest {
    
    @NotNull(message = "Event ID is required")
    private Long eventId;
    
    @NotBlank(message = "Student name is required")
    @Size(min = 2, max = 100)
    private String studentName;
    
    @NotBlank(message = "Student email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255)
    private String studentEmail;
    
    @NotBlank(message = "Roll number is required")
    @Size(max = 50)
    private String studentRollNumber;
    
    @Size(max = 20)
    private String studentPhone;
    
    @Size(max = 100)
    private String department;
    
    private String yearOfStudy;
}
```

---

## Service Layer

### RegistrationService.java (with validation)

```java
package edu.cse.events.service;

import edu.cse.events.dto.*;
import edu.cse.events.entity.*;
import edu.cse.events.exception.*;
import edu.cse.events.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    
    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    
    @Transactional
    public Registration createRegistration(RegistrationCreateRequest request) {
        // Fetch event
        Event event = eventRepository.findById(request.getEventId())
            .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        
        // Validate registration is open
        if (!event.getRegistrationOpen()) {
            throw new RegistrationClosedException("Registration is closed for this event");
        }
        
        // Validate deadline
        if (event.getRegistrationDeadline().isBefore(OffsetDateTime.now())) {
            throw new DeadlinePassedException("Registration deadline has passed");
        }
        
        // Validate max participants
        if (event.getMaxParticipants() != null) {
            long currentCount = registrationRepository.countByEventId(event.getId());
            if (currentCount >= event.getMaxParticipants()) {
                throw new CapacityReachedException("Event has reached maximum capacity");
            }
        }
        
        // Check for duplicate registration
        if (registrationRepository.existsByEventIdAndStudentEmail(
                request.getEventId(), request.getStudentEmail())) {
            throw new DuplicateRegistrationException("Already registered for this event");
        }
        
        // Create registration
        Registration registration = Registration.builder()
            .event(event)
            .studentName(request.getStudentName())
            .studentEmail(request.getStudentEmail())
            .studentRollNumber(request.getStudentRollNumber())
            .studentPhone(request.getStudentPhone())
            .department(request.getDepartment())
            .yearOfStudy(request.getYearOfStudy())
            .build();
        
        return registrationRepository.save(registration);
    }
}
```

---

## Controller Layer

### EventController.java

```java
package edu.cse.events.controller;

import edu.cse.events.dto.*;
import edu.cse.events.entity.Event;
import edu.cse.events.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {
    
    private final EventService eventService;
    
    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents(
            @RequestParam(required = false) String filter) {
        List<EventDto> events = eventService.getAllEvents(filter);
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEvent(@PathVariable Long id) {
        EventDto event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventDto> createEvent(
            @Valid @RequestBody EventCreateRequest request) {
        EventDto event = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventDto> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventCreateRequest request) {
        EventDto event = eventService.updateEvent(id, request);
        return ResponseEntity.ok(event);
    }
    
    @PatchMapping("/{id}/toggle-registration")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventDto> toggleRegistration(@PathVariable Long id) {
        EventDto event = eventService.toggleRegistration(id);
        return ResponseEntity.ok(event);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/registrations/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportRegistrations(@PathVariable Long id) {
        byte[] csvBytes = eventService.exportRegistrationsCsv(id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", 
            "csedepartment_event_" + id + ".csv");
        
        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }
}
```

---

## Flyway Migrations

### V1__init_schema.sql

```sql
-- Create events table
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('symposium', 'workshop', 'contest', 'seminar', 'hackathon', 'other')),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(200),
    max_participants INTEGER,
    registration_open BOOLEAN NOT NULL DEFAULT true,
    poster_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create registrations table
CREATE TABLE registrations (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_roll_number VARCHAR(50) NOT NULL,
    student_phone VARCHAR(20),
    department VARCHAR(100),
    year_of_study VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(event_id, student_email)
);

-- Create indexes
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_registration_open ON events(registration_open);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_student_email ON registrations(student_email);

-- Create admin users table
CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### V2__seed_data.sql

```sql
-- Seed sample events
INSERT INTO events (title, description, event_type, event_date, registration_deadline, venue, max_participants, registration_open)
VALUES
    ('TechVista 2026 - Annual Technical Symposium', 
     'Join us for the flagship technical symposium featuring workshops, competitions, and guest lectures from industry experts.',
     'symposium', '2026-03-15 09:00:00+05:30', '2026-03-10 23:59:59+05:30', 
     'CSE Seminar Hall, Block A', 200, true),
     
    ('Introduction to Machine Learning Workshop',
     'A hands-on workshop covering fundamental ML concepts and practical implementation.',
     'workshop', '2026-02-20 14:00:00+05:30', '2026-02-18 23:59:59+05:30',
     'Computer Lab 3, Block B', 40, true),
     
    ('CodeSprint - 24-Hour Hackathon',
     'Form teams of 3-4 and build innovative solutions to real-world problems.',
     'hackathon', '2026-04-05 08:00:00+05:30', '2026-04-01 23:59:59+05:30',
     'Innovation Hub, Main Building', 100, true);

-- Seed admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, full_name)
VALUES ('admin@csedepartment.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMye', 'System Admin');
```

---

## application.yml

```yaml
spring:
  application:
    name: csedepartment-events
  
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/csedepartment_events}
    username: ${DATABASE_USER:postgres}
    password: ${DATABASE_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
    open-in-view: false
  
  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: ${SERVER_PORT:8080}

jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-change-in-production}
  expiration: 86400000  # 24 hours

cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:5173}
```

---

## Docker Configuration

### Dockerfile

```dockerfile
FROM eclipse-temurin:17-jdk-alpine as build
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: csedepartment_events
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: jdbc:postgresql://postgres:5432/csedepartment_events
      DATABASE_USER: postgres
      DATABASE_PASSWORD: postgres
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-key-min-256-bits}
      CORS_ORIGINS: ${CORS_ORIGINS:-http://localhost:5173}
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    environment:
      VITE_API_BASE_URL: http://localhost:8080/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
```

### .env.example

```env
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/csedepartment_events
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-256-bit-secret-key-change-in-production

# Server
SERVER_PORT=8080
CORS_ORIGINS=http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## Sample API Requests

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@csedepartment.edu", "password": "admin123"}'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 86400000
}
```

### Create Event (Admin)
```bash
curl -X POST http://localhost:8080/api/v1/events \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cloud Computing Workshop",
    "description": "Learn AWS and GCP fundamentals",
    "eventType": "workshop",
    "eventDate": "2026-03-01T10:00:00+05:30",
    "registrationDeadline": "2026-02-28T23:59:59+05:30",
    "venue": "Lab 5, Block C",
    "maxParticipants": 30,
    "registrationOpen": true
  }'
```

### Register (Public)
```bash
curl -X POST http://localhost:8080/api/v1/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "studentName": "Alice Smith",
    "studentEmail": "alice@student.edu",
    "studentRollNumber": "22CSE042",
    "department": "Computer Science",
    "yearOfStudy": "2nd Year"
  }'
```

### Late Registration (400 Error)
```bash
# Response when deadline passed:
{
  "status": 400,
  "error": "Bad Request",
  "message": "Registration deadline has passed",
  "timestamp": "2026-02-03T10:00:00Z"
}
```

### Export CSV (Admin)
```bash
curl http://localhost:8080/api/v1/events/1/registrations/export \
  -H "Authorization: Bearer {token}" \
  -o registrations.csv
```

---

## Production Checklist

- [ ] Change JWT secret to a strong 256-bit key
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Add request logging
- [ ] Set up health checks
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Implement audit logging
- [ ] Review RLS policies

---

## Testing Strategy

### Unit Tests
- Service layer validation logic
- JWT token generation/validation
- CSV export formatting

### Integration Tests
- Event CRUD operations
- Registration flow with validation
- Admin authentication

### Sample Test

```java
@SpringBootTest
class RegistrationServiceTest {
    
    @Autowired
    private RegistrationService registrationService;
    
    @Test
    void shouldRejectLateRegistration() {
        // Create past-deadline event
        Event event = createEventWithPastDeadline();
        
        RegistrationCreateRequest request = RegistrationCreateRequest.builder()
            .eventId(event.getId())
            .studentName("Test Student")
            .studentEmail("test@example.com")
            .studentRollNumber("21CSE001")
            .build();
        
        assertThrows(DeadlinePassedException.class, () -> {
            registrationService.createRegistration(request);
        });
    }
}
```
