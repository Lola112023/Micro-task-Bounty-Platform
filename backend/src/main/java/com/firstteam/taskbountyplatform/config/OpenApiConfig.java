package com.firstteam.taskbountyplatform.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI taskBountyPlatformOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Micro Task Bounty Platform API")
                        .version("1.0.0")
                        .description("小型任务悬赏平台后端API文档")
                        .contact(new Contact()
                                .name("FirstTeam")
                                .email("admin@taskbounty.com")));
    }
}
