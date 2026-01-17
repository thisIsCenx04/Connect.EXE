package com.connectexe.forum;

import com.connectexe.forum.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(scanBasePackages = "com.connectexe")
@EnableConfigurationProperties(JwtProperties.class)
public class ForumServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ForumServiceApplication.class, args);
    }
}
