FROM golang:1.24.0-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY application .
RUN go build -o /app/server server.go

FROM alpine:latest AS runner
COPY --from=builder /app/server /app/server
EXPOSE 8080
CMD ["/app/server"]
