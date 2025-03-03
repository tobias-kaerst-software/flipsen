```mermaid
sequenceDiagram
    DailyDownload<<-->>TMDB: Download Changed Objects from TMDB

    loop Every Object
        DailyDownload->>Storage: Overwrite Object in Storage
        DailyDownload->>+Exporter: Notify about Object Change

        Exporter->>Exporter: Generate Exports for Object
        Exporter<<-->>State: Download State Object
        opt Object Hashes are Equal
            Exporter->>Storage: Update export in Storage
            Exporter->>State: Update State
        end
        Exporter->>-DailyDownload: Notify Downloader
    end
```
