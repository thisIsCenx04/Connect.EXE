package com.connectexe.ai;

import com.connectexe.ai.config.CloudinaryProperties;
import com.connectexe.ai.config.JwtProperties;
import com.connectexe.ai.config.OpenAiProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(scanBasePackages = "com.connectexe")
@EnableConfigurationProperties({ JwtProperties.class, OpenAiProperties.class, CloudinaryProperties.class })
public class AiServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiServiceApplication.class, args);
    }
}
