<template>
    <div>
        <pre>
		</pre>
        <div id="search">
            <h1>Directory Search</h1>
            <input type="text" placeholder="search directory" v-model="search">
            <div class="table">
                <div class="tr">
                    <div class="td">id</div>
                    <div class="td sort"><a v-on:click.prevent="sortCol('first',colDir.first)">First</a> <a v-on:click.prevent="sortCol('last',colDir.last)">Last</a></div>
                    <div class="td">Email</div>
                    <div class="td">
                        <select v-model="department">
							<option value="all">All Departments</option>
							<option v-for="(d,index) in departments" v-bind:key="index" v-bind:value="d" :selected="department==d">{{ d }}</option>
						</select>
                    </div>
                    <div class="td">
                        <select v-model="unit">
							<option value="all">All Units</option>
							<option v-for="(u,index) in units" v-bind:key="index" v-bind:value="u" :selected="unit==u">{{ u }}</option>
						</select>
                    </div>
                </div>
                <div v-for="person in filteredData" v-bind:key="person.id" class="tr">
                    <div class="td">{{ person.id }}</div>
                    <div class="td">{{ person.first }} {{ person.last }}</div>
                    <div class="td">{{ person.email }}</div>
                    <div class="td">{{ person.departmentName }}</div>
                    <div class="td">{{ person.unitName }}</div>
                </div>
            </div>
        </div>
        <hr/>
        <div id="directory">
            <h2>Departments List</h2>
            <div :v-if="directory && directory.length" class="table">
                <div v-for="dep in directory.departments" v-bind:key="dep.departmentId" class="tr">
                    <div class="td">
                        {{ dep.name }} {{ (dep.abbr != "?" ? '(' + dep.abbr + ')' : '') }}
                        <address>
                            {{ dep.locationName }}
                        </address>
                    </div>
                    <div class="td">
                        {{ dep.phone }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash'
    import moment from 'moment'
    import s from 'voca'
    import axios from 'axios'
    export default {
        data() {
            return {
                directory: [],
                people: [],
                search: "",
                department: "all",
                unit: "all",
                errors: [],
                colDir: {
                    'first': 'asc',
                    'last': 'asc'
                },
                lastColDir: {}
            }
        },
        created() {
            axios.get('/src/assets/sample-data.json')
                .then(response => {
                    this.directory = response.data
                    this.getDeptLocations();
                    this.getPersonDept();
                    this.executeFilter();
                }).catch(e => {
                    this.errors.push(e);
                });
        },
        computed: {
            departments: function () {
                let computed = []
                for (let i = 0; i < this.filteredData.length; ++i) {
                    if (computed.indexOf(this.filteredData[i].departmentName) == -1) {
                        computed.push(this.filteredData[i].departmentName);
                    }
                };
                return computed;
            },
            units: function () {
                let computed = []
                for (let i = 0; i < this.filteredData.length; ++i) {
                    if (computed.indexOf(this.filteredData[i].unitName) == -1) {
                        computed.push(this.filteredData[i].unitName);
                    }
                };
                return computed;
            },
            filteredData: {
                get: function () {
                    var filtered = [];
                    if (this.directory.people) {
                        var _self = this;
                        filtered = this.directory.people.filter(function (o) {
                            if (_self.search != "") {
                                if (o.fullName.toLowerCase().indexOf(_self.search.toLowerCase()) == -1) {
                                    return false;
                                }
                            }

                            if (_self.department != "all") {
                                if (o.departmentName.toLowerCase().indexOf(_self.department.toLowerCase()) ==
                                    -1) {
                                    return false;
                                }
                            }

                            if (_self.unit != "all") {
                                if (o.unitName.toLowerCase().indexOf(_self.unit.toLowerCase()) == -1) {
                                    return false;
                                }
                            }

                            return true;
                        });
                    }

                    return filtered;
                },
                set: function (newPeople) {
                    this.directory.people = newPeople;
                }
            }
        },
        methods: {
            sortCol: function (col, dir) {
                this.colDir[col] = (dir == 'asc' ? 'desc' : 'asc')
                this.filteredData = _.orderBy(this.directory.people, [col], [dir])
                this.lastColDir = {
                    'col': col,
                    'dir': dir
                }
            },
            getPersonDept: function () {
                var self = this;
                this.directory.people.forEach(function (person) {
                    person.fullName = person.first + " " + person.last
                    person.visible = false
                    _.find(self.directory.departments, function (dept) {
                        if (dept.id == person.department) {
                            person.departmentName = dept.name
                            _.find(dept.units, function (unit) {
                                if (person.unit == unit.id) {
                                    person.unitName = unit.name
                                }
                            })
                        }
                    })
                })
            },
            getDeptLocations: function () {
                var self = this;
                this.directory.departments.forEach(function (department) {
                    _.find(self.directory.locations, function (o) {
                        if (o.locationId == department.location) {
                            department.locationName = o.address
                        }
                    })
                })
            },
        }
    }
</script>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css?family=Lato:300,400,700');

    html {}

    body {
        background-color: #fdfdfd;
        font-family: 'Lato', sans-serif;
        font-size: 14px;
        color: #333;
        a {
            color: #f19e06;
        }
    }

    .frame {
        width: 100%;
        max-width: 960px;
        margin: 0 auto;
    }

    a {
        text-decoration: none;
        cursor: pointer;
    }

    .table {
        display: table;
        width: 100%;
        .tr {
            display: table-row;
            &:nth-child(odd) {
                background-color: #efefef;
            }
        }
        .td {
            display: table-cell;
            padding: 5px;
        }
    }

    input[type="text"] {
        margin-bottom: 10px;
        border: 1px solid #ececec;
        height: 30px;
        padding-left: 5px;
    }
</style>