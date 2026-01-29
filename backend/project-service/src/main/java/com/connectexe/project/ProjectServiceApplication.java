package com.connectexe.project;

import com.connectexe.project.config.CloudinaryProperties;
import com.connectexe.project.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(scanBasePackages = "com.connectexe")
@EnableConfigurationProperties({JwtProperties.class, CloudinaryProperties.class})
public class ProjectServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectServiceApplication.class, args);
    }
}
