
.PHONY: build-container run-container

build-container:
	docker build -t sixsweb-image .

run-container:
	docker run -p 4200:4200 --name sixs-web sixsweb-image
