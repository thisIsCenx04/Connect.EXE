package com.connectexe.auth;

import org.springframework.boot.SpringApplication;
import com.connectexe.auth.config.AuthFlowProperties;
import com.connectexe.auth.config.JwtProperties;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(scanBasePackages = "com.connectexe")
@EnableConfigurationProperties({JwtProperties.class, AuthFlowProperties.class})
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
