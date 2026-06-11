package com.firstteam.taskbountyplatform.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StringDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class JacksonConfig {

    @Bean
    public SimpleModule xssSanitizerModule() {
        SimpleModule module = new SimpleModule("XssSanitizerModule");
        module.addDeserializer(String.class, new XssStringDeserializer());
        return module;
    }

    private static class XssStringDeserializer extends StringDeserializer {
        @Override
        public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String value = super.deserialize(p, ctxt);
            return sanitize(value);
        }

        private String sanitize(String value) {
            if (value == null) return null;
            return value
                    .replaceAll("(?i)<\\s*script[^>]*>.*?<\\s*/\\s*script\\s*>", "")
                    .replaceAll("(?i)<\\s*/?\\s*script\\s*>", "")
                    .replaceAll("(?i)javascript\\s*:", "")
                    .replaceAll("(?i)on\\w+\\s*=", "_blocked=")
                    .replaceAll("(?i)<\\s*iframe[^>]*>.*?<\\s*/\\s*iframe\\s*>", "")
                    .replaceAll("(?i)<\\s*embed[^>]*>.*?<\\s*/\\s*embed\\s*>", "")
                    .replaceAll("(?i)<\\s*object[^>]*>.*?<\\s*/\\s*object\\s*>", "");
        }
    }
}
