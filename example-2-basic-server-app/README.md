### Introduction

This is a very basic example in which we will try to run a simple nodejs application.

### Remove pods, deployments etc from the cluster

It will be better to start with a clean cluster. Issue following command to delete various items.

```bash
$ kubectl delete pod,svc,rs,deploy --all
```

### Create the deployment

```bash
$ kubectl create -f deployment.yaml
deployment "example-2-basic-server-app" created
```

To check the state of the cluster

```bash
$ kubectl get all
NAME                                             READY     STATUS    RESTARTS   AGE
po/example-2-basic-server-app-3652320502-lh7nr   1/1       Running   0          9s

NAME             CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
svc/kubernetes   10.0.0.1     <none>        443/TCP   16m

NAME                                DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
deploy/example-2-basic-server-app   1         1         1            1           9s

NAME                                       DESIRED   CURRENT   READY     AGE
rs/example-2-basic-server-app-3652320502   1         1         1         9s
```

Notes:
* We end up having a `Pod`, `Deployment` and `Replication Set`
* Look at the columns (DESIRED, CURRENT, UP-TO-DATE, AVAILABLE). They all have the value of 1 as we have specified in our deployment that we want only 1 running Pod.

### Check the logs of the Pod

```bash
$ kubectl logs po/example-2-basic-server-app-3652320502-lh7nr
Example app listening on port 3000 !
```

Note the name of the Pod as this will be different for you.

### Accessing the server

In the previous step we were able to have a Pod running and can even see the logs that it generated. If you look inside [index.js](app/index.js) file you will see that going to the root should return `Hello World!` but question is where is the IP address or domain name of node on which this container is running ?

In Kubernetes the Pods are not available outside the cluster so the first step for us to do is to front it with another construct called `Service`.

```bash
$ kubectl create -f service.yaml
service "example-2-frontend" created

$ kubectl get all
NAME                                             READY     STATUS    RESTARTS   AGE
po/example-2-basic-server-app-3652320502-lh7nr   1/1       Running   0          53s

NAME                     CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
svc/example-2-frontend   10.0.242.160   <pending>     80:31265/TCP   2s
svc/kubernetes           10.0.0.1       <none>        443/TCP        17m

NAME                                DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
deploy/example-2-basic-server-app   1         1         1            1           53s

NAME                                       DESIRED   CURRENT   READY     AGE
rs/example-2-basic-server-app-3652320502   1         1         1         53s
```

The service we created is of type `LoadBalancer` and with the help of `selector` we are able to route the traffic to all the Pods that have the label `app:example-2`.

Notice `<pending>` in the EXTERNAL-IP column. The Kubernetes implementation of a cloud provider is supposed to create a LoadBalancer when you create a service with type LoadBalancer. You should look in your resource group in Azure and you would see one extra LoadBalancer automatically created.

Doing `kubectl get all` after **few minutes** should result in following -

```bash
$ kubectl get all
NAME                                             READY     STATUS    RESTARTS   AGE
po/example-2-basic-server-app-3652320502-lh7nr   1/1       Running   0          5m

NAME                     CLUSTER-IP     EXTERNAL-IP    PORT(S)        AGE
svc/example-2-frontend   10.0.242.160   13.84.164.83   80:31265/TCP   4m
svc/kubernetes           10.0.0.1       <none>         443/TCP        21m

NAME                                DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
deploy/example-2-basic-server-app   1         1         1            1           5m

NAME                                       DESIRED   CURRENT   READY     AGE
rs/example-2-basic-server-app-3652320502   1         1         1         5m
```

Your server is now accessible at the IP address that you will see in EXTERNAL-IP column.

```bash
$ curl http://13.84.164.83
Hello World from 10.244.3.184
```

Note the IP address displayed in the output is that of the Pod.

### Scaling the Deployment

In deployment.yaml we have specified that we only want 1 Pod (1 Replica). Our cluster has been running for some time now and a request has arrived to run 3 instances of our Pod. The scaling can be achieved by either modifying the yaml file and recreate it or by issuing the command to scale.

```bash
$ kubectl scale deployment example-2-basic-server-app --replicas=3
deployment "example-2-basic-server-app" scaled

$ kubectl get all
NAME                                             READY     STATUS    RESTARTS   AGE
po/example-2-basic-server-app-3652320502-bbk2f   1/1       Running   0          11s
po/example-2-basic-server-app-3652320502-gg2qt   1/1       Running   0          11s
po/example-2-basic-server-app-3652320502-lh7nr   1/1       Running   0          6m

NAME                     CLUSTER-IP     EXTERNAL-IP    PORT(S)        AGE
svc/example-2-frontend   10.0.242.160   13.84.164.83   80:31265/TCP   5m
svc/kubernetes           10.0.0.1       <none>         443/TCP        23m

NAME                                DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
deploy/example-2-basic-server-app   3         3         3            3           6m

NAME                                       DESIRED   CURRENT   READY     AGE
rs/example-2-basic-server-app-3652320502   3         3         3         6m
```

Lets curl again few times to see if we can see round-robin style load balancing happening or not.

```bash
$ curl http://13.84.164.83
Hello World from 10.244.0.47

$ curl http://13.84.164.83
Hello World from 10.244.2.93

$ curl http://13.84.164.83
Hello World from 10.244.3.184
```

and indeed it is !!

This example shows how a Service fronts the replicas of a Pod, expose a public IP address and provide a load balancing.
