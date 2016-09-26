Statful Collector AWS
==============

[![NPM version][npm-image]][npm-url] [![Build Status](https://travis-ci.org/statful/statful-collector-aws.svg?branch=master)](https://travis-ci.org/statful/statful-collector-aws)

Staful Collector AWS built in NodeJS. This is intended to collect metrics from AWS CloudWatch and send them to Statful.

## Table of Contents

* [Supported NodeJS Versions](#supported-nodejs-versions)
* [Installation](#installation)
* [Quick Start](#quick-start)
* [Examples](#examples)
* [Reference](#reference)
* [Authors](#authors)
* [License](#license)

## Supported NodeJS Versions

| Statful Collector AWS Version | Tested NodeJS versions  |
|:---|:---|
| 1.x.x | `4` and `Stable` |

## Installation

```bash
$ npm install -g statful-collector-aws
```

## Quick start

After installing Statful Collector AWS you are ready to use it. The quickest way is to do the following:

```bash
$ statful-collector-aws generate-config /etc/statful-collector-aws/conf/

# Update some info in the statful-collector-aws-conf.json: accessKeyId, secretAccessKey and the statful api token

$ statful-collector-aws start /etc/statful-collector-aws/conf/statful-collector-aws-conf.json
```

## Examples

You can find here some useful usage examples of the Statful Collector AWS. In the following examples are assumed you have already installed the collector globally and followed the [Quick Start](#quick-start).

### Collect a list of metrics

```json
{
  "statfulAwsCollector": {
    ... ,
    "period": 60,
    "statistics": ["SampleCount", "Average", "Sum", "Minimum", "Maximum"],
    "metricsList": {
      "type": "white",
      "metricsPerRegion": {
        "us-west-2": [
          {
            "Namespace": "AWS/ELB"
          },
          {
            "Namespace": "AWS/AutoScaling",
            "MetricName": "GroupMinSize"
          },
          {
            "Namespace": "AWS/AutoScaling",
            "MetricName": "GroupMaxSize"
          },
          {
            "Namespace": "AWS/AutoScaling",
            "MetricName": "GroupStandbyInstances"
          }
        ]
      }
    },
    ...
  },
  ...
}
```

### Collect a metric with different dimensions

```json
{
  "statfulAwsCollector": {
    ... ,
    "period": 60,
    "statistics": ["SampleCount", "Average", "Sum", "Minimum", "Maximum"],
    "metricsList": {
      "type": "white",
      "metricsPerRegion": {
        "us-west-2": [
          {
            "Namespace": "AWS/ELB"
          },
          {
            "Namespace": "AWS/Billing",
            "MetricName": "EstimatedCharges",
            "Dimensions": [
            	{
            		"Name": "ServiceName",
            		"Value": "Service1"
            	},
            	{
            		"Name": "ServiceName",
            		"Value": "Service12"
            	},
            	{
            		"Name": "Currency",
            		"Value": "USD"
            	},
            	{
            		"Name": "Currency",
            		"Value": "EUR"
            	}
            ]
          }
        ]
      }
    },
    ...
  },
  ...
}
```

### Collect metrics from more than one region

```json
{
  "statfulAwsCollector": {
    ... ,
    "period": 300,
    "statistics": ["SampleCount", "Average", "Sum", "Minimum", "Maximum"],
    "metricsList": {
      "type": "white",
      "metricsPerRegion": {
      	"eu-central-1": [
          {
            "Namespace": "AWS/Billing"
          }
        ],
      	"us-west-1": [
          {
            "Namespace": "AWS/Billing"
          }
        ],
        "us-west-2": [
          {
            "Namespace": "AWS/Billing"
          }
        ]
      }
    },
    ...
  },
  ...
}
```

## Reference

Detailed reference if you want to take full advantage from Statful Collector AWS.

### CLI

```bash
$ statful-collector-aws generate-config <path>
```

Creates a default configuration at the given path. If the given path doesn't exists, it will be created.

```bash
$ statful-collector-aws start <path>
```

Starts the collector with the config on given path.

```bash
$ statful-collector-aws help
```

Shows a small help for the collector.

### Configuration

In the configuration file you can find 3 main sections: `statfulAwsCollector`, `bunyan`, `statfulClient`.

**StatfulAWSCollector**

| Option | Description | Type | Default | Required |
|:---|:---|:---|:---|:---|
| _credentials_ | Defines the credentials to access AWS. | `object` | **none** | **YES** |
| _period_ | Defines the global output level.</br></br> **Valid Periods:** `60, 120, 180, 300` | `number` | 60 | **YES** |
| _statistics_ | Define the statistcs for which data should be collected.</br></br> **Valid Statistics:** `SampleCount, Average, Sum, Minimum, Maximum` | `array` | `["SampleCount", "Average", "Sum", "Minimum", "Maximum"]` | **YES** |
| _metricsList_ | Defines metrics to collect from AWS. Here you should only configure the `metricsPerRegion` which is an object organized by AWS region. Inside each region you should set a list of metrics object to collect. Each metric object supports a `Namespace`, `MetricName` and  `Dimensions`.</br> Please check the AWS documentation ([AWS Metric Reference](http://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_Metric.html) and [Amazon CloudWatch Namespaces, Dimensions, and Metrics Reference](http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CW_Support_For_AWS.html)) and the [Examples](#examples) section to get more information about the metrics object. | `object` | **none** | **YES** |
| _signals_ | Defines the proccess signals for which collector should be stopped. Any valid NodeJS signal can be added. | `array` | `["SIGTERM", "SIGINT", "SIGABRT", "SIGUSR2"]` | **YES** |

**Bunyan**

| Option | Description | Type | Default | Required |
|:---|:---|:---|:---|:---|
| _name_ | Defines the logger name. | `string` | **none** | **YES** |
| _level_ | Defines the global output level. | `string` | **none** | **NO** |
| _streams_ | Define the logger streams. By default, when the value is an empty array, logger will output to `proccess.stdout`. | `array` | `[]` | **YES** |

> **NOTE:** We had only documented some bunyan config fields here but you can set all the supported configs by Bunyan.

To get more information please read the [Bunyan documentation](https://github.com/trentm/node-bunyan).

**StatfulClient**

| Option | Description | Type | Default | Required |
|:---|:---|:---|:---|:---|
| _app_ | Defines the application global name. If specified sets a global tag `app=setValue`. | `string` | **none** | **NO** |
| _default_ | Object to set methods options. | `object` | `{}` | **NO** |
| _api_ | Defined API configurations. | `object` | **none** | **NO** |
| _dryRun_ | Defines if metrics should be output to the logger instead of being send. | `boolean` | `false` | **NO** |
| _flushInterval_ | Defines the periodicity of buffer flushes in **miliseconds**. | `number` | `3000` | **NO** |
| _flushSize_ | Defines the maximum buffer size before performing a flush. | `number` | `1000` | **NO** |
| _namespace_ | Defines the global namespace. | `string` | `application` | **NO** |
| _sampleRate_ | Defines the rate sampling. **Should be a number between [1, 100]**. | `number` | `100` | **NO** |
| _tags_ | Defines the global tags. | `object` | `{}` | **NO** |
| _transport_ | Defines the transport layer to be used to send metrics.</br></br> **Valid Transports:** `udp, api` | `string` | **none** | **YES** |
| _host_ | Defines the host name to where the metrics should be sent. Can also be set inside _api_. | `string` | `127.0.0.1` | **NO** |
| _port_ | Defines the port. Can also be set inside _api_. | `string` | `2013` | **NO** |
| _token_ | Defines the token to be used.  Must be set inside _api_. | `string` | **none** | **NO** |
| _timeout_ | Defines the timeout for the transport layers in **miliseconds**. Must be set inside _api_. | `number` | `2000` | **NO** |

To get more information please read the [Statful Client NodeJS documentation](https://github.com/statful/statful-client-nodejs).

## Authors

[Mindera - Software Craft](https://github.com/Mindera)

## License

Statful AWS Collector is available under the MIT license. See the [LICENSE](https://raw.githubusercontent.com/statful/statful-aws-collector/master/LICENSE) file for more information.
