package com.sbpbs;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/projects")
public class ProjectController {
 private final ProjectService service; public ProjectController(ProjectService service){this.service=service;}
 @GetMapping public List<ProjectResponse> all(){return service.all();}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public ProjectResponse create(@Valid @RequestBody ProjectRequest request){return service.create(request);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){service.delete(id);}
}
