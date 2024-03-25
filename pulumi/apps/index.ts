import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const mongodbUri = config.requireSecret("mongodb_uri").apply((s) => Buffer.from(s).toString("base64"));
const kiteApiKey = config.requireSecret("kite_api_key").apply((s) => Buffer.from(s).toString("base64"));
const kiteApiSecret = config.requireSecret("kite_api_secret").apply((s) => Buffer.from(s).toString("base64"));
const sessionSecret = config.requireSecret("session_secret").apply((s) => Buffer.from(s).toString("base64"));
const kafkaUri = config.requireSecret("kafka_uri").apply((s) => Buffer.from(s).toString("base64"));

const versionClient = config.get("version_client") ?? "latest";
const versionServer = config.get("version_server") ?? "latest";
const versionTickWorkers = config.get("version_tick_workers") ?? "latest";

const stonkNinjaNs = new k8s.core.v1.Namespace("stonk-ninja", {
  apiVersion: "v1",
  kind: "Namespace",
  metadata: {
    name: "stonk-ninja",
  },
});

const stonkNinjaSecrets = new k8s.core.v1.Secret(
  "stonk-ninja-secrets",
  {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: "stonk-ninja-secrets",
      namespace: "stonk-ninja",
    },
    type: "Opaque",
    data: {
      mongodbUri,
      kiteApiKey,
      kiteApiSecret,
      sessionSecret,
      kafkaUri,
    },
  },
  {
    dependsOn: [stonkNinjaNs],
  },
);

const stonkNinjaServer = new k8s.apps.v1.Deployment(
  "stonk-ninja-server",
  {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: "stonk-ninja-server-deployment",
      namespace: "stonk-ninja",
      labels: {
        app: "stonk-ninja-server",
      },
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: "stonk-ninja-server",
        },
      },
      template: {
        metadata: {
          labels: {
            app: "stonk-ninja-server",
          },
        },
        spec: {
          containers: [
            {
              name: "stonk-ninja-server",
              image: `brayn003/stonk.ninja-server:${versionServer}`,
              env: [
                {
                  name: "MONGODB_URI",
                  valueFrom: {
                    secretKeyRef: {
                      name: "stonk-ninja-secrets",
                      key: "mongodbUri",
                    },
                  },
                },
                {
                  name: "KITE_API_KEY",
                  valueFrom: {
                    secretKeyRef: {
                      name: "stonk-ninja-secrets",
                      key: "kiteApiKey",
                    },
                  },
                },
                {
                  name: "KITE_API_SECRET",
                  valueFrom: {
                    secretKeyRef: {
                      name: "stonk-ninja-secrets",
                      key: "kiteApiSecret",
                    },
                  },
                },
                {
                  name: "SESSION_SECRET",
                  valueFrom: {
                    secretKeyRef: {
                      name: "stonk-ninja-secrets",
                      key: "sessionSecret",
                    },
                  },
                },
              ],
              resources: {
                requests: { memory: "250Mi", cpu: "200m" },
                limits: { memory: "1Gi", cpu: "1" },
              },
            },
          ],
        },
      },
    },
  },
  {
    dependsOn: [stonkNinjaNs, stonkNinjaSecrets],
  },
);

const stonkNinjaServerService = new k8s.core.v1.Service(
  "stonk-ninja-server-service",
  {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: "stonk-ninja-server-service",
      namespace: "stonk-ninja",
    },
    spec: {
      selector: {
        app: "stonk-ninja-server",
      },
      type: "NodePort",
      ports: [{ name: "http-port", protocol: "TCP", port: 80, targetPort: 8000 }],
    },
  },
  {
    dependsOn: [stonkNinjaNs, stonkNinjaServer],
  },
);

const stonkNinjaClient = new k8s.apps.v1.Deployment(
  "stonk-ninja-client",
  {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: "stonk-ninja-client-deployment",
      namespace: "stonk-ninja",
      labels: {
        app: "stonk-ninja-client",
      },
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: "stonk-ninja-client",
        },
      },
      template: {
        metadata: {
          labels: {
            app: "stonk-ninja-client",
          },
        },
        spec: {
          containers: [
            {
              name: "stonk-ninja-client",
              image: `brayn003/stonk.ninja-client:${versionClient}`,
              env: [
                {
                  name: "SERVER_PRIVATE_URL",
                  value: "http://stonk-ninja-server-service.stonk-ninja.svc.cluster.local",
                },
              ],
              resources: {
                requests: { memory: "250Mi", cpu: "200m" },
                limits: { memory: "500Mi", cpu: "500m" },
              },
            },
          ],
        },
      },
    },
  },
  {
    dependsOn: [stonkNinjaNs],
  },
);

const stonkNinjaClientService = new k8s.core.v1.Service(
  "stonk-ninja-client-service",
  {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: "stonk-ninja-client-service",
      namespace: "stonk-ninja",
    },
    spec: {
      selector: {
        app: "stonk-ninja-client",
      },
      type: "NodePort",
      ports: [{ name: "http-port", protocol: "TCP", port: 80, targetPort: 3000 }],
    },
  },
  {
    dependsOn: [stonkNinjaNs, stonkNinjaClient],
  },
);

const stonkNinjaIngress = new k8s.networking.v1.Ingress(
  "stonk-ninja-ingress",
  {
    apiVersion: "networking.k8s.io/v1",
    kind: "Ingress",
    metadata: {
      name: "stonk-ninja-ingress",
      namespace: "stonk-ninja",
      annotations: {
        "cert-manager.io/cluster-issuer": "cert-issuer-letsencrypt",
        // needed for acme challenge resolvers
        // "acme.cert-manager.io/http01-edit-in-place": "true",
        // "ingress.kubernetes.io/ssl-redirect": "false",
      },
    },
    spec: {
      ingressClassName: "nginx",
      tls: [{ hosts: ["stonk.ninja"], secretName: "stonk.ninja-tls" }],
      rules: [
        {
          host: "stonk.ninja",
          http: {
            paths: [
              {
                path: "/",
                pathType: "Prefix",
                backend: {
                  service: {
                    name: "stonk-ninja-client-service",
                    port: { name: "http-port" },
                  },
                },
              },
              {
                path: "/api",
                pathType: "Prefix",
                backend: {
                  service: {
                    name: "stonk-ninja-server-service",
                    port: { name: "http-port" },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    dependsOn: [stonkNinjaNs, stonkNinjaServerService],
  },
);

const stonkNinjaTickProducer = new k8s.apps.v1.Deployment(
  "stonk-ninja-tick-producer",
  {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: "stonk-ninja-tick-producer-deployment",
      namespace: "stonk-ninja",
      labels: {
        app: "stonk-ninja-tick-producer",
      },
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: "stonk-ninja-tick-producer",
        },
      },
      template: {
        metadata: {
          labels: {
            app: "stonk-ninja-tick-producer",
          },
        },
        spec: {
          containers: [
            {
              name: "stonk-ninja-tick-producer",
              image: `brayn003/stonk.ninja-tick-workers:${versionTickWorkers}`,
              args: ["producer"],
              env: [
                {
                  name: "MONGODB_URI",
                  valueFrom: {
                    secretKeyRef: {
                      name: "stonk-ninja-secrets",
                      key: "mongodbUri",
                    },
                  },
                },
                {
                  name: "KAFKA_URI",
                  valueFrom: {
                    secretKeyRef: {
                      name: "stonk-ninja-secrets",
                      key: "kafkaUri",
                    },
                  },
                },
              ],
              resources: {
                requests: { memory: "100Mi", cpu: "100m" },
                limits: { memory: "250Mi", cpu: "200m" },
              },
            },
          ],
        },
      },
    },
  },
  {
    dependsOn: [stonkNinjaNs],
  },
);

const stonkNinjaTickRecorder = new k8s.apps.v1.Deployment(
  "stonk-ninja-tick-recorder",
  {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: "stonk-ninja-tick-recorder-deployment",
      namespace: "stonk-ninja",
      labels: {
        app: "stonk-ninja-tick-recorder",
      },
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: "stonk-ninja-tick-recorder",
        },
      },
      template: {
        metadata: {
          labels: {
            app: "stonk-ninja-tick-recorder",
          },
        },
        spec: {
          containers: [
            {
              name: "stonk-ninja-tick-recorder",
              image: `brayn003/stonk.ninja-tick-workers:${versionTickWorkers}`,
              args: ["recorder"],
              env: [
                {
                  name: "MONGODB_URI",
                  valueFrom: {
                    secretKeyRef: {
                      name: "stonk-ninja-secrets",
                      key: "mongodbUri",
                    },
                  },
                },
                {
                  name: "KAFKA_URI",
                  valueFrom: {
                    secretKeyRef: {
                      name: "stonk-ninja-secrets",
                      key: "kafkaUri",
                    },
                  },
                },
              ],
              resources: {
                requests: { memory: "100Mi", cpu: "100m" },
                limits: { memory: "250Mi", cpu: "200m" },
              },
            },
          ],
        },
      },
    },
  },
  {
    dependsOn: [stonkNinjaNs],
  },
);

export const stonkNinjaServerUrn = stonkNinjaServer.urn;
export const stonkNinjaServerServiceUrn = stonkNinjaServerService.urn;
export const stonkNinjaIngressUrn = stonkNinjaIngress.urn;
export const stonkNinjaClientUrn = stonkNinjaClient.urn;
export const stonkNinjaClientServiceUrn = stonkNinjaClientService.urn;
export const stonkNinjaTickProducerUrn = stonkNinjaTickProducer.urn;
export const stonkNinjaTickRecorderUrn = stonkNinjaTickRecorder.urn;
