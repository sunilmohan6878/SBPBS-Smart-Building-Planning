package com.sbpbs;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.databind.JsonNode;
public class ProjectRequest {
 @NotBlank private String projectName; private String owner; private String location; private Double area; private Integer floors; private String style; private JsonNode analysis;
 public String getProjectName(){return projectName;} public void setProjectName(String v){projectName=v;}
 public String getOwner(){return owner;} public void setOwner(String v){owner=v;}
 public String getLocation(){return location;} public void setLocation(String v){location=v;}
 public Double getArea(){return area;} public void setArea(Double v){area=v;}
 public Integer getFloors(){return floors;} public void setFloors(Integer v){floors=v;}
 public String getStyle(){return style;} public void setStyle(String v){style=v;}
 public JsonNode getAnalysis(){return analysis;} public void setAnalysis(JsonNode v){analysis=v;}
}
