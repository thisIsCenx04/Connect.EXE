package com.connectexe.halloffame;

import com.connectexe.halloffame.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(scanBasePackages = "com.connectexe")
@EnableConfigurationProperties(JwtProperties.class)
public class HallOfFameServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(HallOfFameServiceApplication.class, args);
    }
}
