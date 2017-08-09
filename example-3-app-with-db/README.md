### Introduction

This is an example to demonstrate how to deploy an app with database. We would use mongodb as the database and would like to keep the storage
out of the Pod so that in the case of Pod termination and restart we do not lose our data.

### Remove pods, deployments etc from the cluster

It will be better to start with a clean cluster. Issue following command to delete various items.

```bash
$ kubectl delete deploy,svc,pod,svc,rs, --all
```

### Create a data disk in Azure

I am not sure why Microsoft has made this process very complicated (took me some time to figure it out) so here are the steps:

* You need a Storage Account. When the kubernetes cluster was created one storage account was created for you automatically. Issue following command to see its name
```bash
$ az storage account list -o table
CreationTime                      Kind     Location        Name                  PrimaryLocation    ProvisioningState    ResourceGroup    StatusOfPrimary
--------------------------------  -------  --------------  --------------------  -----------------  -------------------  ---------------  -----------------
2017-08-09T13:28:28.716810+00:00  Storage  southcentralus  00hadbnwnrnqbbyagnt0  southcentralus     Succeeded            ksachdeva-exp    available
```

* In the storage account we need to create a container. Issue following command to create it.
```bash
$ az storage container create -n mongodisk --account-name 00hadbnwnrnqbbyagnt0
```

At this point of time you have a `container` in your storage account. In this container we need to now add a `data-disk`.

Based on what I saw there is no option to instruct Azure to create the data-disk so we have to first create it locally and then upload it. This is not a trivial process but fortunately there are set of scripts written by https://github.com/colemickens/azure-tools to simplify the process. The author of the script has put all these scripts in a docker image to make the usage simpler.

Before pulling the `azure-tools` docker image make sure to prepare following environment variables:

```bash
export AZURE_SUBSCRIPTION_ID=<FILL_IT_PLEASE>
export AZURE_RESOURCE_GROUP=ksachdeva-exp
export AZURE_STORAGE_ACCOUNT=00hadbnwnrnqbbyagnt0
export AZURE_STORAGE_CONTAINER=mongodisk
export IMAGE_SIZE=10G
export MKFS_TYPE=ext4
export AZURE_LOCATION=southcentralus
export BLOB_NAME=mongo-data-disk
```

Now we will pull docker image and run its container in the interactive mode:

```bash
docker pull docker.io/colemickens/azure-tools:latest
docker run -it docker.io/colemickens/azure-tools:latest

# Once you are inside the container paste the above environment variables
# in the shell and then run the script make-vhd.sh. This scripts creates as well
# as uploads the data disk.

export AZURE_SUBSCRIPTION_ID=<FILL_IT_PLEASE>
export AZURE_RESOURCE_GROUP=ksachdeva-exp
export AZURE_STORAGE_ACCOUNT=00hadbnwnrnqbbyagnt0
export AZURE_STORAGE_CONTAINER=mongodisk
export IMAGE_SIZE=10G
export MKFS_TYPE=ext4
export AZURE_LOCATION=southcentralus
export BLOB_NAME=mongo-data-disk

./make-vhd.sh
```

The execution of the above script would show the upload progress of disk as well. In order to check it via command line, issue following command:

```bash
$ az storage blob exists --container-name mongodisk -n mongo-data-disk.vhd --account-name 00hadbnwnrnqbbyagnt0
```

We now need the url to this blob (VHD) that needs to specified in our deployment file.

```bash
$ az storage blob url --container-name mongodisk -n mongo-data-disk.vhd --account-name 00hadbnwnrnqbbyagnt0 -o table
Result
--------------------------------------------------------------------------------
https://00hadbnwnrnqbbyagnt0.blob.core.windows.net/mongodisk/mongo-data-disk.vhd
```

## Deploy the mongodb Pod and Service

Notes:

* Look in the db-deployment.yaml to understand the concept of external mount/volume.
* We also require a Service that fronts the mongodb deployment. Since this service is not to exposed outside we do not specify the `type` for it.

```bash
kubectl create -f db-service.yaml
kubectl create -f db-deployment.yaml
```

## Deploy the nodejs application Pod and Service

```bash
kubectl create -f app-service.yaml
kubectl create -f app-deployment.yaml
```

Nothing special going on here in terms of deployment however you should pay attention to how the application would get the URL to the mongodb database.

In Kubernetes you can use either the environment variables or the DNS. In Auzre, the cluster has the DNS enabled so we are able to simply use the name of the DB service i.e `mongo-master` in our case.

To check if DNS is enabled in your cluster or not, issue following command:

```bash
$ kubectl get services kube-dns --namespace=kube-system
NAME       CLUSTER-IP   EXTERNAL-IP   PORT(S)         AGE
kube-dns   10.0.0.10    <none>        53/UDP,53/TCP   4h
```
