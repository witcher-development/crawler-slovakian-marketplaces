# crawler-slovakian-marketplaces

docker build --no-cache -t "crawler-script-image" .
docker run -d --network host --name crawler-script crawler-script-image
