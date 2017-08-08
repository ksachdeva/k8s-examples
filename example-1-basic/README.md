### Introduction

This is a very basic example in which we will try to run an ubuntu container that echos 'hello world' after every 1 second.

Notes:
* It is a `Deployment`.
* We have specified that we are only interested in 1 replica i.e. only 1 instance of container will be created.
* Since in Kubernetes the most basic unit if a Pod we should say that this will deploy only 1 Pod.
* In this example, the one Pod contains one container.

### Check what we have in the cluster

```bash
$ kubectl get pods
No resources found.
```

```bash
$ kubectl get all
NAME             CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
svc/kubernetes   10.0.0.1     <none>        443/TCP   3m
```

### Create the deployment

```bash
$ kubectl create -f example-1-basic/deployment.yaml
deployment "example-1-basic" created
```

To check the state of the cluster

```bash
$ kubectl get all
NAME                                  READY     STATUS    RESTARTS   AGE
po/example-1-basic-3444702635-9ttjp   1/1       Running   0          3m

NAME             CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
svc/kubernetes   10.0.0.1     <none>        443/TCP   11m

NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
deploy/example-1-basic   1         1         1            1           3m

NAME                            DESIRED   CURRENT   READY     AGE
rs/example-1-basic-3444702635   1         1         1         3m
```

Notes:
* We end up having a `Pod`, `Deployment` and `Replication Set`
* Look at the columns (DESIRED, CURRENT, UP-TO-DATE, AVAILABLE). They all have the value of 1 as we have specified in our deployment that we want only 1 running Pod.

### Check the logs of the Pod

```bash
$ kubectl logs example-1-basic-3444702635-9ttjp
hello world
hello world
hello world
hello world
...
...
```

Note the name of the Pod as this will be different for you.

### Delete the Pod

We will now try to delete the Pod. Because in our Deployment we have specified that we want to have 1 Pod instance always running, Kubernetes should automatically start a new instance after we deleted the Pod manually.

```bash
$ kubectl delete pod example-1-basic-3444702635-9ttjp
pod "example-1-basic-3444702635-9ttjp" deleted

# Make sure to issue below command very quickly to see the status of your
# cluster
$ kubectl get all
NAME                                  READY     STATUS        RESTARTS   AGE
po/example-1-basic-3444702635-9ttjp   1/1       Terminating   0          11m
po/example-1-basic-3444702635-d6wrp   1/1       Running       0          7s

NAME             CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
svc/kubernetes   10.0.0.1     <none>        443/TCP   20m

NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
deploy/example-1-basic   1         1         1            1           11m

NAME                            DESIRED   CURRENT   READY     AGE
rs/example-1-basic-3444702635   1         1         1         11m
```

As it should be clear, my older Pod instance (example-1-basic-3444702635-9ttjp) is being deleted (Terminating) and a new one is starting. Essentially Kubernetes is respecting what you have asked to do i.e. to make sure that 1 Pod instance of example-1-basic is always running.

### Delete the Deployment

Deleting the deployment is different from deleting the Pod as this is what instructs the Kubernetes that we are not interested anymore in running the Pod.

```bash
$ kubectl delete deployment example-1-basic
deployment "example-1-basic" deleted

# Make sure to issue below command very quickly to see the status of your
# cluster
$ kubectl get all
NAME                                  READY     STATUS        RESTARTS   AGE
po/example-1-basic-3444702635-d6wrp   1/1       Terminating   0          4m

NAME             CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
svc/kubernetes   10.0.0.1     <none>        443/TCP   24m
```

### Scaling the Deployment

If you are following the example in steps then make sure to create the deployment again (`kubectl create -f example-1-basic/deployment.yaml`).

In deployment.yaml we have specified that we only want 1 Pod (1 Replica). Our cluster has been running for some time now and a request has arrived to run 3 instances of our Pod. The scaling can be achieved by either modifying the yaml file and recreate it or by issuing the command to scale.

```bash
$ kubectl scale deployment example-1-basic --replicas=3
deployment "example-1-basic" scaled

$ kubectl get all
NAME                                  READY     STATUS              RESTARTS   AGE
po/example-1-basic-3444702635-98lpn   0/1       ContainerCreating   0          3s
po/example-1-basic-3444702635-h7qfm   0/1       ContainerCreating   0          3s
po/example-1-basic-3444702635-zs87f   1/1       Running             0          4m

NAME             CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
svc/kubernetes   10.0.0.1     <none>        443/TCP   31m

NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
deploy/example-1-basic   3         3         3            2           4m

NAME                            DESIRED   CURRENT   READY     AGE
rs/example-1-basic-3444702635   3         3         2         4m
```

Notice the STATUS column of our Pods.

After few seconds the state of cluster should look like this -:

```bash
$ kubectl get all
NAME                                  READY     STATUS    RESTARTS   AGE
po/example-1-basic-3444702635-98lpn   1/1       Running   0          31s
po/example-1-basic-3444702635-h7qfm   1/1       Running   0          31s
po/example-1-basic-3444702635-zs87f   1/1       Running   0          4m

NAME             CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
svc/kubernetes   10.0.0.1     <none>        443/TCP   32m

NAME                     DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
deploy/example-1-basic   3         3         3            3           4m

NAME                            DESIRED   CURRENT   READY     AGE
rs/example-1-basic-3444702635   3         3         3         4m
```
