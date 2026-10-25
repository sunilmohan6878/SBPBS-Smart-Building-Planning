package com.sbpbs;
public class ProjectNotFoundException extends RuntimeException { public ProjectNotFoundException(Long id){super("Project not found: "+id);} }
