export function getTestData(){
    return {
        "drawflow": {
            "Home": {
                "data": {
                    "1": {
                        "id": 1,
                        "name": "Line",
                        "data": {
                            "type": "Line",
                            "color": "red",
                            "name": "Line",
                            "title": "Line 1",
                            "inputs": 1,
                            "outputs": 1,
                            "steadyStateCurrentRating": 50,
                            "length": 2000,
                            "admitance": 1,
                            "emergency4HourRating": 6,
                            "emergency2HourRating": 3
                        },
                        "class": "newTop",
                        "html": "\n      <div class=\"diagram-node\">\n        Line 1 - Line\n      </div>\n      ",
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
                        "outputs": {
                            "output_1": {
                                "connections": []
                            }
                        },
                        "pos_x": 517,
                        "pos_y": 68
                    },
                    "2": {
                        "id": 2,
                        "name": "DieselGenerator",
                        "data": {
                            "type": "DieselGenerator",
                            "name": "DieselGenerator",
                            "color": "green",
                            "title": "Diesel Generator 1",
                            "inputs": 1,
                            "outputs": 3,
                            "nominalPower": 50,
                            "namePlateMaximumPower": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div class=\"diagram-node\">\n        Diesel Generator 1 - Diesel Generator\n      </div>\n      ",
                        "typenode": false,
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "3",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "5",
                                        "output": "input_1"
                                    }
                                ]
                            },
                            "output_2": {
                                "connections": [
                                    {
                                        "node": "1",
                                        "output": "input_1"
                                    },
                                    {
                                        "node": "4",
                                        "output": "input_1"
                                    },
                                    {
                                        "node": "6",
                                        "output": "input_1"
                                    }
                                ]
                            },
                            "output_3": {
                                "connections": []
                            }
                        },
                        "pos_x": 0,
                        "pos_y": 0
                    },
                    "3": {
                        "id": 3,
                        "name": "UtilitySource",
                        "data": {
                            "type": "UtilitySource",
                            "color": "",
                            "name": "UtilitySource",
                            "title": "Utility Source 1",
                            "inputs": 0,
                            "outputs": 1,
                            "nominalVoltage": 1000,
                            "maximumPowerFactor": 2000,
                            "minimumPowerFactor": 500,
                            "maximumCurrentAvailable": 1000
                        },
                        "class": "newTop",
                        "html": "\n      <div class=\"diagram-node\">\n        Utility Source 1 - US\n      </div>\n      ",
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
                        "pos_x": -341,
                        "pos_y": 11
                    },
                    "4": {
                        "id": 4,
                        "name": "Bus",
                        "data": {
                            "type": "Bus",
                            "name": "Bus",
                            "color": "",
                            "title": "Bus 1",
                            "inputs": 1,
                            "outputs": 1
                        },
                        "class": "newTop",
                        "html": "\n      <div class=\"diagram-node\">\n        Bus 1 - Bus\n      </div>\n      ",
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
                        "outputs": {
                            "output_1": {
                                "connections": []
                            }
                        },
                        "pos_x": 486,
                        "pos_y": -54
                    },
                    "5": {
                        "id": 5,
                        "name": "Bus",
                        "data": {
                            "type": "Bus",
                            "name": "Bus",
                            "color": "",
                            "title": "Bus 2",
                            "inputs": 1,
                            "outputs": 1
                        },
                        "class": "newTop",
                        "html": "\n      <div class=\"diagram-node\">\n        Bus 2 - Bus\n      </div>\n      ",
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
                        "outputs": {
                            "output_1": {
                                "connections": []
                            }
                        },
                        "pos_x": 553,
                        "pos_y": -134
                    },
                    "6": {
                        "id": 6,
                        "name": "Battery",
                        "data": {
                            "type": "Battery",
                            "name": "Battery",
                            "color": "",
                            "title": "Battery 1",
                            "inputs": 1,
                            "outputs": 1,
                            "rateOfCharge": 50,
                            "rateOfDischarge": 50,
                            "storage": 50
                        },
                        "class": "newTop",
                        "html": "\n      <div class=\"diagram-node\">\n        Battery 1 - Battery\n      </div>\n      ",
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
                        "outputs": {
                            "output_1": {
                                "connections": []
                            }
                        },
                        "pos_x": 516,
                        "pos_y": 172
                    }
                }
            }
        }
    }


}