
export function getTestData(){
    return  {
            "drawflow": {
                "Home": {
                    "data": {
                        "1": {
                            "id": 1,
                            "name": "Load",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Load",
                                "name": "Load",
                                "title": "Town",
                                "inputs": 1,
                                "outputs": 1,
                                "powerFactor": null,
                                "reduction": 50,
                                "timeAllowedForOutage": 5
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Load 1 - Load\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": [
                                        {
                                            "node": "2",
                                            "input": "output_2"
                                        }
                                    ]
                                }
                            },
                            "outputs": {},
                            "pos_x": 920,
                            "pos_y": 427
                        },
                        "2": {
                            "id": 2,
                            "name": "Bus",
                            "data": {
                                "styling": {
                                    "height": "440px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Bus",
                                "name": "Bus",
                                "title": "Main Town Bus",
                                "inputs": 1,
                                "outputs": 1
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Bus 1 - Bus\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": [
                                        {
                                            "node": "4",
                                            "input": "output_1"
                                        }
                                    ]
                                },
                                "input_2": {
                                    "connections": [
                                        {
                                            "node": "5",
                                            "input": "output_1"
                                        }
                                    ]
                                },
                                "input_3": {
                                    "connections": [
                                        {
                                            "node": "6",
                                            "input": "output_1"
                                        }
                                    ]
                                },
                                "input_4": {
                                    "connections": [
                                        {
                                            "node": "7",
                                            "input": "output_1"
                                        }
                                    ]
                                },
                                "input_5": {
                                    "connections": [
                                        {
                                            "node": "8",
                                            "input": "output_1"
                                        }
                                    ]
                                },
                                "input_6": {
                                    "connections": [
                                        {
                                            "node": "10",
                                            "input": "output_1"
                                        }
                                    ]
                                },
                                "input_7": {
                                    "connections": [
                                        {
                                            "node": "9",
                                            "input": "output_1"
                                        }
                                    ]
                                },
                                "input_8": {
                                    "connections": [
                                        {
                                            "node": "13",
                                            "input": "output_1"
                                        }
                                    ]
                                }
                            },
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "3",
                                            "output": "input_1"
                                        }
                                    ]
                                },
                                "output_2": {
                                    "connections": [
                                        {
                                            "node": "1",
                                            "output": "input_1"
                                        }
                                    ]
                                }
                            },
                            "pos_x": 623,
                            "pos_y": 190
                        },
                        "3": {
                            "id": 3,
                            "name": "Battery",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Battery",
                                "name": "Battery",
                                "title": "Main Battery",
                                "inputs": 1,
                                "outputs": 1,
                                "rateOfCharge": 50,
                                "rateOfDischarge": 50,
                                "storage": 50
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Battery 1 - Battery\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": [
                                        {
                                            "node": "2",
                                            "input": "output_1"
                                        }
                                    ]
                                }
                            },
                            "outputs": {},
                            "pos_x": 919,
                            "pos_y": 339
                        },
                        "4": {
                            "id": 4,
                            "name": "DieselGenerator",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "DieselGenerator",
                                "name": "DieselGenerator",
                                "title": "Gen 1",
                                "inputs": 1,
                                "outputs": 3,
                                "nominalPower": 50,
                                "namePlateMaximumPower": 50
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 1 - Diesel Generator\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {},
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "2",
                                            "output": "input_1"
                                        }
                                    ]
                                }
                            },
                            "pos_x": 212,
                            "pos_y": -52
                        },
                        "5": {
                            "id": 5,
                            "name": "DieselGenerator",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "DieselGenerator",
                                "name": "DieselGenerator",
                                "title": "Gen 2",
                                "inputs": 1,
                                "outputs": 3,
                                "nominalPower": 50,
                                "namePlateMaximumPower": 50
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 2 - Diesel Generator\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {},
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "2",
                                            "output": "input_2"
                                        }
                                    ]
                                }
                            },
                            "pos_x": 213.11111111111111,
                            "pos_y": 13
                        },
                        "6": {
                            "id": 6,
                            "name": "DieselGenerator",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "DieselGenerator",
                                "name": "DieselGenerator",
                                "title": "Gen 3",
                                "inputs": 1,
                                "outputs": 3,
                                "nominalPower": 50,
                                "namePlateMaximumPower": 50
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 3 - Diesel Generator\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {},
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "2",
                                            "output": "input_3"
                                        }
                                    ]
                                }
                            },
                            "pos_x": 212,
                            "pos_y": 80.11111111111111
                        },
                        "7": {
                            "id": 7,
                            "name": "DieselGenerator",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "DieselGenerator",
                                "name": "DieselGenerator",
                                "title": "Gen 4",
                                "inputs": 1,
                                "outputs": 3,
                                "nominalPower": 50,
                                "namePlateMaximumPower": 50
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 4 - Diesel Generator\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {},
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "2",
                                            "output": "input_4"
                                        }
                                    ]
                                }
                            },
                            "pos_x": 212,
                            "pos_y": 146
                        },
                        "8": {
                            "id": 8,
                            "name": "DieselGenerator",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "DieselGenerator",
                                "name": "DieselGenerator",
                                "title": "Gen 5",
                                "inputs": 1,
                                "outputs": 3,
                                "nominalPower": 50,
                                "namePlateMaximumPower": 50
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 5 - Diesel Generator\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {},
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "2",
                                            "output": "input_5"
                                        }
                                    ]
                                }
                            },
                            "pos_x": 214,
                            "pos_y": 219
                        },
                        "9": {
                            "id": 9,
                            "name": "Line",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Line",
                                "name": "Line",
                                "title": "Feeder 3",
                                "inputs": 1,
                                "outputs": 1,
                                "steadyStateCurrentRating": 50,
                                "length": 2000,
                                "admitance": 1,
                                "emergency4HourRating": 6,
                                "emergency2HourRating": 3
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Line 1 - Line\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": [
                                        {
                                            "node": "11",
                                            "input": "output_1"
                                        }
                                    ]
                                }
                            },
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "2",
                                            "output": "input_7"
                                        }
                                    ]
                                }
                            },
                            "pos_x": 251,
                            "pos_y": 439
                        },
                        "10": {
                            "id": 10,
                            "name": "DieselGenerator",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "DieselGenerator",
                                "name": "DieselGenerator",
                                "title": "Standby Gen",
                                "inputs": 1,
                                "outputs": 3,
                                "nominalPower": 50,
                                "namePlateMaximumPower": 50
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 6 - Diesel Generator\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {},
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "2",
                                            "output": "input_6"
                                        }
                                    ]
                                }
                            },
                            "pos_x": 175,
                            "pos_y": 285.6666666666667
                        },
                        "11": {
                            "id": 11,
                            "name": "Load",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Load",
                                "name": "Load",
                                "title": "Tuungaalik Labe",
                                "inputs": 1,
                                "outputs": 1,
                                "powerFactor": null,
                                "reduction": 50,
                                "timeAllowedForOutage": 5
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Load 2 - Load\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {},
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "9",
                                            "output": "input_1"
                                        }
                                    ]
                                }
                            },
                            "pos_x": -9,
                            "pos_y": 438.3333333333333
                        },
                        "13": {
                            "id": 13,
                            "name": "Line",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Line",
                                "name": "Line",
                                "title": "Feeder 4.1",
                                "inputs": 1,
                                "outputs": 1,
                                "steadyStateCurrentRating": 50,
                                "length": 2000,
                                "admitance": 1,
                                "emergency4HourRating": 6,
                                "emergency2HourRating": 3
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Line 2 - Line\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": [
                                        {
                                            "node": "14",
                                            "input": "output_1"
                                        }
                                    ]
                                }
                            },
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "2",
                                            "output": "input_8"
                                        }
                                    ]
                                }
                            },
                            "pos_x": 297,
                            "pos_y": 548
                        },
                        "14": {
                            "id": 14,
                            "name": "Bus",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Bus",
                                "name": "Bus",
                                "title": "Navy Station",
                                "inputs": 1,
                                "outputs": 1
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Bus 2 - Bus\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": [
                                        {
                                            "node": "15",
                                            "input": "output_1"
                                        }
                                    ]
                                },
                                "input_2": {
                                    "connections": [
                                        {
                                            "node": "16",
                                            "input": "output_1"
                                        }
                                    ]
                                }
                            },
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "13",
                                            "output": "input_1"
                                        }
                                    ]
                                }
                            },
                            "pos_x": 41.666666666666664,
                            "pos_y": 549
                        },
                        "15": {
                            "id": 15,
                            "name": "Line",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Line",
                                "name": "Line",
                                "title": "Feeder 4.2",
                                "inputs": 1,
                                "outputs": 1,
                                "steadyStateCurrentRating": 50,
                                "length": 2000,
                                "admitance": 1,
                                "emergency4HourRating": 6,
                                "emergency2HourRating": 3
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Line 3 - Line\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": [
                                        {
                                            "node": "17",
                                            "input": "output_1"
                                        }
                                    ]
                                }
                            },
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "14",
                                            "output": "input_1"
                                        }
                                    ]
                                }
                            },
                            "pos_x": -224,
                            "pos_y": 536.3333333333334
                        },
                        "16": {
                            "id": 16,
                            "name": "Load",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Load",
                                "name": "Load",
                                "title": "Navy Station",
                                "inputs": 1,
                                "outputs": 1,
                                "powerFactor": null,
                                "reduction": 50,
                                "timeAllowedForOutage": 5
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Load 3 - Load\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": []
                                }
                            },
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "14",
                                            "output": "input_2"
                                        }
                                    ]
                                }
                            },
                            "pos_x": -226,
                            "pos_y": 630.6666666666666
                        },
                        "17": {
                            "id": 17,
                            "name": "Bus",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Bus",
                                "name": "Bus",
                                "title": "Bus 3",
                                "inputs": 1,
                                "outputs": 1
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Bus 3 - Bus\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": [
                                        {
                                            "node": "20",
                                            "input": "output_1"
                                        }
                                    ]
                                },
                                "input_2": {
                                    "connections": [
                                        {
                                            "node": "18",
                                            "input": "output_1"
                                        }
                                    ]
                                },
                                "input_3": {
                                    "connections": [
                                        {
                                            "node": "19",
                                            "input": "output_1"
                                        }
                                    ]
                                }
                            },
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "15",
                                            "output": "input_1"
                                        }
                                    ]
                                }
                            },
                            "pos_x": -487.3333333333333,
                            "pos_y": 537
                        },
                        "18": {
                            "id": 18,
                            "name": "WindGenerator",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "WindGenerator",
                                "name": "WindGenerator",
                                "title": "Wind",
                                "inputs": 1,
                                "outputs": 1,
                                "nominalPower": 50,
                                "namePlateMaximumPower": 50,
                                "maxOutput": 50
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Wind Generator 1 - Wind Generator\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": []
                                }
                            },
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "17",
                                            "output": "input_2"
                                        }
                                    ]
                                }
                            },
                            "pos_x": -745.3333333333334,
                            "pos_y": 583
                        },
                        "19": {
                            "id": 19,
                            "name": "SolarGenerator",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "SolarGenerator",
                                "name": "SolarGenerator",
                                "title": "Solar",
                                "inputs": 1,
                                "outputs": 1,
                                "nominalPower": 50,
                                "namePlateMaximumPower": 50
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Solar Generator 1 - Solar Generator\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": []
                                }
                            },
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "17",
                                            "output": "input_3"
                                        }
                                    ]
                                }
                            },
                            "pos_x": -746,
                            "pos_y": 650
                        },
                        "20": {
                            "id": 20,
                            "name": "Load",
                            "data": {
                                "styling": {
                                    "height": "40px",
                                    "width": "200px"
                                },
                                "color": "",
                                "type": "Load",
                                "name": "Load",
                                "title": "Renewable Field",
                                "inputs": 1,
                                "outputs": 1,
                                "powerFactor": null,
                                "reduction": 50,
                                "timeAllowedForOutage": 5
                            },
                            "class": "newTop",
                            "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Load 4 - Load\n      </div>\n      ",
                            "typenode": false,
                            "inputs": {
                                "input_1": {
                                    "connections": []
                                }
                            },
                            "outputs": {
                                "output_1": {
                                    "connections": [
                                        {
                                            "node": "17",
                                            "output": "input_1"
                                        }
                                    ]
                                }
                            },
                            "pos_x": -746,
                            "pos_y": 521.6666666666666
                        }
                    }
                }
            }
        }
}
export function getAnalysisTestData(){
    return {
        "drawflow": {
            "Home": {
                "data": {
                    "1": {
                        "id": 1,
                        "name": "Load",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "red",
                            "type": "Load",
                            "name": "Load",
                            "title": "Town",
                            "inputs": 1,
                            "outputs": 1,
                            "powerFactor": null,
                            "reduction": 50,
                            "timeAllowedForOutage": 5
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Load 1 - Load\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "input": "output_2"
                                    }
                                ]
                            }
                        },
                        "outputs": {},
                        "pos_x": 920,
                        "pos_y": 427
                    },
                    "2": {
                        "id": 2,
                        "name": "Bus",
                        "data": {
                            "styling": {
                                "height": "440px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "Bus",
                            "name": "Bus",
                            "title": "Main Town Bus",
                            "inputs": 1,
                            "outputs": 1
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Bus 1 - Bus\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "4",
                                        "input": "output_1"
                                    }
                                ]
                            },
                            "input_2": {
                                "connections": [
                                    {
                                        "node": "5",
                                        "input": "output_1"
                                    }
                                ]
                            },
                            "input_3": {
                                "connections": [
                                    {
                                        "node": "6",
                                        "input": "output_1"
                                    }
                                ]
                            },
                            "input_4": {
                                "connections": [
                                    {
                                        "node": "7",
                                        "input": "output_1"
                                    }
                                ]
                            },
                            "input_5": {
                                "connections": [
                                    {
                                        "node": "8",
                                        "input": "output_1"
                                    }
                                ]
                            },
                            "input_6": {
                                "connections": [
                                    {
                                        "node": "10",
                                        "input": "output_1"
                                    }
                                ]
                            },
                            "input_7": {
                                "connections": [
                                    {
                                        "node": "9",
                                        "input": "output_1"
                                    }
                                ]
                            },
                            "input_8": {
                                "connections": [
                                    {
                                        "node": "13",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "3",
                                        "output": "input_1"
                                    }
                                ]
                            },
                            "output_2": {
                                "connections": [
                                    {
                                        "node": "1",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": 623,
                        "pos_y": 190
                    },
                    "3": {
                        "id": 3,
                        "name": "Battery",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "Battery",
                            "name": "Battery",
                            "title": "Main Battery",
                            "inputs": 1,
                            "outputs": 1,
                            "rateOfCharge": 50,
                            "rateOfDischarge": 50,
                            "storage": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Battery 1 - Battery\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {},
                        "pos_x": 919,
                        "pos_y": 339
                    },
                    "4": {
                        "id": 4,
                        "name": "DieselGenerator",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "DieselGenerator",
                            "name": "DieselGenerator",
                            "title": "Gen 1",
                            "inputs": 1,
                            "outputs": 3,
                            "nominalPower": 50,
                            "namePlateMaximumPower": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 1 - Diesel Generator\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {},
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": 212,
                        "pos_y": -52
                    },
                    "5": {
                        "id": 5,
                        "name": "DieselGenerator",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "DieselGenerator",
                            "name": "DieselGenerator",
                            "title": "Gen 2",
                            "inputs": 1,
                            "outputs": 3,
                            "nominalPower": 50,
                            "namePlateMaximumPower": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 2 - Diesel Generator\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {},
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "output": "input_2"
                                    }
                                ]
                            }
                        },
                        "pos_x": 213.11111111111111,
                        "pos_y": 13
                    },
                    "6": {
                        "id": 6,
                        "name": "DieselGenerator",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "DieselGenerator",
                            "name": "DieselGenerator",
                            "title": "Gen 3",
                            "inputs": 1,
                            "outputs": 3,
                            "nominalPower": 50,
                            "namePlateMaximumPower": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 3 - Diesel Generator\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {},
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "output": "input_3"
                                    }
                                ]
                            }
                        },
                        "pos_x": 212,
                        "pos_y": 80.11111111111111
                    },
                    "7": {
                        "id": 7,
                        "name": "DieselGenerator",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "DieselGenerator",
                            "name": "DieselGenerator",
                            "title": "Gen 4",
                            "inputs": 1,
                            "outputs": 3,
                            "nominalPower": 50,
                            "namePlateMaximumPower": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 4 - Diesel Generator\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {},
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "output": "input_4"
                                    }
                                ]
                            }
                        },
                        "pos_x": 212,
                        "pos_y": 146
                    },
                    "8": {
                        "id": 8,
                        "name": "DieselGenerator",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "DieselGenerator",
                            "name": "DieselGenerator",
                            "title": "Gen 5",
                            "inputs": 1,
                            "outputs": 3,
                            "nominalPower": 50,
                            "namePlateMaximumPower": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 5 - Diesel Generator\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {},
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "output": "input_5"
                                    }
                                ]
                            }
                        },
                        "pos_x": 214,
                        "pos_y": 219
                    },
                    "9": {
                        "id": 9,
                        "name": "Line",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "Line",
                            "name": "Line",
                            "title": "Feeder 3",
                            "inputs": 1,
                            "outputs": 1,
                            "steadyStateCurrentRating": 50,
                            "length": 2000,
                            "admitance": 1,
                            "emergency4HourRating": 6,
                            "emergency2HourRating": 3
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Line 1 - Line\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "11",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "output": "input_7"
                                    }
                                ]
                            }
                        },
                        "pos_x": 251,
                        "pos_y": 439
                    },
                    "10": {
                        "id": 10,
                        "name": "DieselGenerator",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "DieselGenerator",
                            "name": "DieselGenerator",
                            "title": "Standby Gen",
                            "inputs": 1,
                            "outputs": 3,
                            "nominalPower": 50,
                            "namePlateMaximumPower": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Diesel Generator 6 - Diesel Generator\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {},
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "output": "input_6"
                                    }
                                ]
                            }
                        },
                        "pos_x": 175,
                        "pos_y": 285.6666666666667
                    },
                    "11": {
                        "id": 11,
                        "name": "Load",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "Load",
                            "name": "Load",
                            "title": "Tuungaalik Labe",
                            "inputs": 1,
                            "outputs": 1,
                            "powerFactor": null,
                            "reduction": 50,
                            "timeAllowedForOutage": 5
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Load 2 - Load\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {},
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "9",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": -9,
                        "pos_y": 438.3333333333333
                    },
                    "13": {
                        "id": 13,
                        "name": "Line",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "Line",
                            "name": "Line",
                            "title": "Feeder 4.1",
                            "inputs": 1,
                            "outputs": 1,
                            "steadyStateCurrentRating": 50,
                            "length": 2000,
                            "admitance": 1,
                            "emergency4HourRating": 6,
                            "emergency2HourRating": 3
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Line 2 - Line\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "14",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "output": "input_8"
                                    }
                                ]
                            }
                        },
                        "pos_x": 297,
                        "pos_y": 548
                    },
                    "14": {
                        "id": 14,
                        "name": "Bus",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "Bus",
                            "name": "Bus",
                            "title": "Navy Station",
                            "inputs": 1,
                            "outputs": 1
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Bus 2 - Bus\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "15",
                                        "input": "output_1"
                                    }
                                ]
                            },
                            "input_2": {
                                "connections": [
                                    {
                                        "node": "16",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "13",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": 41.666666666666664,
                        "pos_y": 549
                    },
                    "15": {
                        "id": 15,
                        "name": "Line",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "Line",
                            "name": "Line",
                            "title": "Feeder 4.2",
                            "inputs": 1,
                            "outputs": 1,
                            "steadyStateCurrentRating": 50,
                            "length": 2000,
                            "admitance": 1,
                            "emergency4HourRating": 6,
                            "emergency2HourRating": 3
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Line 3 - Line\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "17",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "14",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": -224,
                        "pos_y": 536.3333333333334
                    },
                    "16": {
                        "id": 16,
                        "name": "Load",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "red",
                            "type": "Load",
                            "name": "Load",
                            "title": "Navy Station",
                            "inputs": 1,
                            "outputs": 1,
                            "powerFactor": null,
                            "reduction": 50,
                            "timeAllowedForOutage": 5
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Load 3 - Load\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": []
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "14",
                                        "output": "input_2"
                                    }
                                ]
                            }
                        },
                        "pos_x": -226,
                        "pos_y": 630.6666666666666
                    },
                    "17": {
                        "id": 17,
                        "name": "Bus",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "Bus",
                            "name": "Bus",
                            "title": "Bus 3",
                            "inputs": 1,
                            "outputs": 1
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Bus 3 - Bus\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "20",
                                        "input": "output_1"
                                    }
                                ]
                            },
                            "input_2": {
                                "connections": [
                                    {
                                        "node": "18",
                                        "input": "output_1"
                                    }
                                ]
                            },
                            "input_3": {
                                "connections": [
                                    {
                                        "node": "19",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "15",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": -487.3333333333333,
                        "pos_y": 537
                    },
                    "18": {
                        "id": 18,
                        "name": "WindGenerator",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "WindGenerator",
                            "name": "WindGenerator",
                            "title": "Wind",
                            "inputs": 1,
                            "outputs": 1,
                            "nominalPower": 50,
                            "namePlateMaximumPower": 50,
                            "maxOutput": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Wind Generator 1 - Wind Generator\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": []
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "17",
                                        "output": "input_2"
                                    }
                                ]
                            }
                        },
                        "pos_x": -745.3333333333334,
                        "pos_y": 583
                    },
                    "19": {
                        "id": 19,
                        "name": "SolarGenerator",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "",
                            "type": "SolarGenerator",
                            "name": "SolarGenerator",
                            "title": "Solar",
                            "inputs": 1,
                            "outputs": 1,
                            "nominalPower": 50,
                            "namePlateMaximumPower": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Solar Generator 1 - Solar Generator\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": []
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "17",
                                        "output": "input_3"
                                    }
                                ]
                            }
                        },
                        "pos_x": -746,
                        "pos_y": 650
                    },
                    "20": {
                        "id": 20,
                        "name": "Load",
                        "data": {
                            "styling": {
                                "height": "40px",
                                "width": "200px"
                            },
                            "color": "green",
                            "type": "Load",
                            "name": "Load",
                            "title": "Renewable Field",
                            "inputs": 1,
                            "outputs": 1,
                            "powerFactor": null,
                            "reduction": 50,
                            "timeAllowedForOutage": 5
                        },
                        "class": "newTop",
                        "html": "\n      <div style=\"height: 40px;width: 200px;\" class=\"diagram-node\">\n        Load 4 - Load\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": []
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "17",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": -744,
                        "pos_y": 514.3333333333334
                    }
                }
            }
        }
    }
}

