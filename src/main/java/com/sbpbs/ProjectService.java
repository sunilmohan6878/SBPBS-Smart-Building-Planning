package com.sbpbs;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
public class ProjectService {
 private final ProjectRepository repo; private final ObjectMapper mapper;
 public ProjectService(ProjectRepository repo,ObjectMapper mapper){this.repo=repo;this.mapper=mapper;}
 @Transactional(readOnly=true) public List<ProjectResponse> all(){return repo.findAll().stream().map(this::response).toList();}
 @Transactional public ProjectResponse create(ProjectRequest r){
  ProjectRecord p=new ProjectRecord(); p.setProjectName(r.getProjectName().trim());p.setOwner(r.getOwner());p.setLocation(r.getLocation());p.setArea(r.getArea());p.setFloors(r.getFloors());p.setStyle(r.getStyle());
  try{p.setAnalysisJson(r.getAnalysis()==null?"{}":mapper.writeValueAsString(r.getAnalysis()));}catch(Exception e){throw new IllegalArgumentException("Invalid analysis JSON");}
  return response(repo.save(p));
 }
 @Transactional public void delete(Long id){if(!repo.existsById(id)) throw new ProjectNotFoundException(id);repo.deleteById(id);}
 private ProjectResponse response(ProjectRecord p){try{JsonNode a=mapper.readTree(p.getAnalysisJson()==null?"{}":p.getAnalysisJson());return new ProjectResponse(p.getId(),p.getProjectName(),p.getOwner(),p.getLocation(),p.getArea(),p.getFloors(),p.getStyle(),p.getCreatedAt(),a);}catch(Exception e){throw new IllegalStateException("Could not read stored project analysis",e);}}
}
