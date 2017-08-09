# Building a Kubernetes cluster in Microsoft Azure

## Install Azure CLI 2.0

See the instructions at https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

## Create a resource group

```bash
az group create -n ksachdeva-exp
```

## Create a Azure Container Service (ACS)

```bash
# This command takes few minutes to complete
az acs create --orchestrator-type=kubernetes --resource-group ksachdeva-exp --name=ksachdeva-exp-acs --generate-ssh-keys
```

### Notes:
* This command can easily take 5+ minute to complete
* If it goes over 10 minute then you may want to exit out of it and delete the resource group `az group delete -n ksachdeva-exp` and issue the command again.

## Set your shell with the appropriate credentials

```bash
az acs kubernetes get-credentials --resource-group=ksachdeva-exp --name=ksachdeva-exp-acs
```

# Various Examples

* [A very basic example](example-1-basic)
* [A basic server application](example-2-basic-server-app)
* [A web app with database with a persistent disk](example-3-app-with-db)
