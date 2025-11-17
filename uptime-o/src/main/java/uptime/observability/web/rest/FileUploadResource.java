package uptime.observability.web.rest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uptime.observability.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for file uploads (logo, favicon).
 */
@RestController
@RequestMapping("/api/files")
public class FileUploadResource {

    private static final Logger LOG = LoggerFactory.getLogger(FileUploadResource.class);
    
    @Value("${application.branding.enabled:false}")
    private boolean brandingEnabled;
    
    @Value("${application.upload.path:${user.home}/.uptimeo/uploads}")
    private String uploadPath;

    /**
     * Upload logo or favicon file.
     */
    @PostMapping("/upload/{type}")
    public ResponseEntity<Map<String, String>> uploadFile(
        @PathVariable String type,
        @RequestParam("file") MultipartFile file
    ) {
        if (!brandingEnabled) {
            throw new BadRequestAlertException("File upload requires branding to be enabled", "file", "disabled");
        }

        if (file.isEmpty()) {
            throw new BadRequestAlertException("File is empty", "file", "empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (!isValidImageType(contentType)) {
            throw new BadRequestAlertException("Invalid file type. Use PNG, JPG, SVG, or ICO", "file", "invalidtype");
        }

        // Validate file size (max 2MB)
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new BadRequestAlertException("File too large. Maximum size is 2MB", "file", "toolarge");
        }
        
        // Validate image type and size constraints
        if ("logo".equals(type)) {
            // Logo: recommend max 400x100px for navbar compatibility
            if (file.getSize() > 500 * 1024) { // 500KB max for logo
                throw new BadRequestAlertException("Logo file too large. Maximum size is 500KB", "file", "logotoolarge");
            }
        }
        
        if ("favicon".equals(type)) {
            // Favicon: should be small, square format (16x16, 32x32, 48x48)
            if (file.getSize() > 100 * 1024) { // 100KB max for favicon
                throw new BadRequestAlertException("Favicon file too large. Maximum size is 100KB", "file", "favicontoolarge");
            }
        }

        try {
            String fileName = generateFileName(type, file.getOriginalFilename());
            String filePath = saveFile(file, fileName);
            
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("filePath", filePath);
            response.put("url", "/api/files/" + fileName);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            LOG.error("Failed to upload file", e);
            throw new BadRequestAlertException("Failed to upload file", "file", "uploadfailed");
        }
    }

    private boolean isValidImageType(String contentType) {
        return contentType != null && (
            contentType.equals("image/png") ||
            contentType.equals("image/jpeg") ||
            contentType.equals("image/jpg") ||
            contentType.equals("image/svg+xml") ||
            contentType.equals("image/x-icon") ||
            contentType.equals("image/vnd.microsoft.icon")
        );
    }

    private String generateFileName(String type, String originalName) {
        String extension = getFileExtension(originalName);
        long timestamp = System.currentTimeMillis();
        return type + "_" + timestamp + "." + extension;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "png";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    private String saveFile(MultipartFile file, String fileName) throws IOException {
        Path uploadDir = Paths.get(uploadPath);
        
        // Create directory if it doesn't exist
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        
        Path filePath = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return "/api/files/" + fileName;
    }

    /**
     * Serve uploaded files.
     */
    @GetMapping("/{fileName}")
    public ResponseEntity<byte[]> getFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadPath).resolve(fileName);
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileContent = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            
            return ResponseEntity.ok()
                .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                .body(fileContent);
        } catch (IOException e) {
            LOG.error("Failed to serve file: {}", fileName, e);
            return ResponseEntity.notFound().build();
        }
    }
}