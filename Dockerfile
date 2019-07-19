FROM maven

COPY YCSBjson /home/YCSBjson
COPY mongofake /home/mongofake
COPY workloads /home/workloads
COPY init.py /home/init.py

RUN apt-get update && apt-get upgrade -y && apt-get install curl memcached -y

# nodejs/fakeit part
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
WORKDIR /home/mongofake
RUN rm node_modules/fakeit
RUN npm install --save fakeit
RUN npm install --save mongodb

EXPOSE 11211

WORKDIR /home/YCSBjson
RUN mvn -pl com.yahoo.ycsb:mongodb-binding -am package -DskipTests dependency:build-classpath -DincludeScope=compile -Dmdep.outputFilterFile=true

WORKDIR /home
CMD service memcached restart && python init.py