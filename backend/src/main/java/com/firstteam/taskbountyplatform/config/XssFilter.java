package com.firstteam.taskbountyplatform.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Order(1)
public class XssFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        chain.doFilter(new XssRequestWrapper((HttpServletRequest) request), response);
    }

    private static class XssRequestWrapper extends HttpServletRequestWrapper {

        XssRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            String value = super.getParameter(name);
            return sanitize(value);
        }

        @Override
        public String[] getParameterValues(String name) {
            String[] values = super.getParameterValues(name);
            if (values == null) return null;
            String[] cleaned = new String[values.length];
            for (int i = 0; i < values.length; i++) {
                cleaned[i] = sanitize(values[i]);
            }
            return cleaned;
        }

        @Override
        public Map<String, String[]> getParameterMap() {
            Map<String, String[]> map = super.getParameterMap();
            return map.entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            e -> {
                                String[] values = e.getValue();
                                String[] cleaned = new String[values.length];
                                for (int i = 0; i < values.length; i++) {
                                    cleaned[i] = sanitize(values[i]);
                                }
                                return cleaned;
                            }
                    ));
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
