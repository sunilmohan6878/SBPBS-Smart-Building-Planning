package com.sbpbs;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="projects")
public class ProjectRecord {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=180) private String projectName;
 @Column(length=180) private String owner;
 @Column(length=300) private String location;
 private Double area;
 private Integer floors;
 @Column(length=80) private String style;
 @Lob @Column(columnDefinition="LONGTEXT") private String analysisJson;
 private Instant createdAt;
 @PrePersist void beforeInsert(){ if(createdAt==null) createdAt=Instant.now(); }
 public Long getId(){return id;} public void setId(Long v){id=v;}
 public String getProjectName(){return projectName;} public void setProjectName(String v){projectName=v;}
 public String getOwner(){return owner;} public void setOwner(String v){owner=v;}
 public String getLocation(){return location;} public void setLocation(String v){location=v;}
 public Double getArea(){return area;} public void setArea(Double v){area=v;}
 public Integer getFloors(){return floors;} public void setFloors(Integer v){floors=v;}
 public String getStyle(){return style;} public void setStyle(String v){style=v;}
 public String getAnalysisJson(){return analysisJson;} public void setAnalysisJson(String v){analysisJson=v;}
 public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant v){createdAt=v;}
}
