<template>
    <div>
        <pre>
        </pre>
        <div id="search">
            <input type="text" placeholder="search directory" v-model="search" v-on:keyup="executeFilter">
            <div class="table">
                <div class="tr">
                    <div class="td">id</div>
                    <div class="td sort"><a v-on:click.prevent="sortCol('first',colDir.first)">First</a> <a v-on:click.prevent="sortCol('last',colDir.last)">Last</a></div>
                    <div class="td">Email</div>
                    <div class="td">
                        <select ref="curDept" @change="executeFilter">
                            <!-- <option disabled>Departments</option> -->
                            <option value="all">All Departments</option>
                            <option v-for="(d,index) in departments" v-bind:key="index" v-bind:value="d" :selected="department==d">{{ d }}</option>
                        </select>
                    </div>
                    <div class="td">
                        <select ref="curUnit" @change="executeFilter">
                            <!-- <option disabled selected>Units</option> -->
                            <option value="all">All Units</option>
                            <option v-for="(u,index) in units" v-bind:key="index" v-bind:value="u" :selected="unit==u">{{ u }}</option>
                        </select>
                    </div>
                </div>
                <!-- v-show="person.visible" -->
                <div v-for="person in people" v-bind:key="person.id" class="tr">
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
                // location: '',
                // searchResults:[],
                directory: [],
                people: [],
                search: "",
                department: "",
                unit: "",
                errors: [],
                colDir : {'first':'asc','last':'asc'},
                lastColDir : {}
                // orderBy:[{'col': 'last','order':'asc'}],
                // unitFilter:'',
                // deptFilter:'',
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
			departments: function() {
				let computed = []
				for (let i = 0; i < this.people.length; ++i) {
				   if( computed.indexOf(this.people[i].departmentName) == -1 ) {
						computed.push(this.people[i].departmentName);   
				   }
				};
				return computed;
			},
			units: function() {
				let computed = []
				for (let i = 0; i < this.people.length; ++i) {
				   if( computed.indexOf(this.people[i].unitName) == -1 ) {
						computed.push(this.people[i].unitName);   
				   }
				};
				return computed;
			},
		},
        watch: {
            // 'directory.people': {
            //     handler(people) {
            //         var self = this
            //         people.forEach(function (person) {
            //             if (person.visible) {
            //                 if (self.units.indexOf(person.unitName) == -1) {
            //                     self.units.push(person.unitName)
            //                     self.departments.push(person.departmentName)
            //                 }
            //             }
            //         })
            //     },
            //     deep: true
            // }
            //   orderBy:function(){
            //       console.log(this.searchResults);
            //     //    return console.log(_.orderBy(this.searchResults,this.orderBy.col,this.orderBy.order))
            //   },
            //   unitFilter:function(){
            //       _.filter(this.searchResults,_.bind(function(person){
            //           if(person.unitName == this.unitFilter){
            //               if(this.unitFilter == "all"){
            //                   person.visible = false;
            //               }else{
            //                   person.visible = true
            //               this.searchResults = Object.assign({},this.searchResults,{
            //                   [person.pId] : person
            //             })
            //             this.updateFilters("add",person);
            //               }
            //           }else{
            //               person.visible = false
            //               this.searchResults = Object.assign({},this.searchResults,{
            //                   [person.pId] : person
            //             })
            //             this.updateFilters("remove",person);
            //           }
            //       },this))
            //   },
            //   deptFilter:function(){
            //       _.filter(this.searchResults,_.bind(function(person){
            //           if(person.departmentName == this.deptFilter){
            //               person.visible = true
            //               this.searchResults = Object.assign({},this.searchResults,{
            //                   [person.pId] : person
            //             })
            //             this.updateFilters("add",person);
            //           }else{
            //               person.visible = false
            //               this.searchResults = Object.assign({},this.searchResults,{
            //                   [person.pId] : person
            //             })
            //             this.updateFilters("remove",person);
            //           }
            //       },this))
            //   }
        },
        methods: {
            executeFilter: function() {
                this.department = this.$refs.curDept.value;
                this.unit = this.$refs.curUnit.value;
                var _self = this;
                var filtered = this.directory.people.filter(function(o){
                    if( _self.search != "" ) {
                        if( o.fullName.toLowerCase().indexOf(_self.search.toLowerCase()) == -1 ) {
                            return false;
                        }
                    }

                    if( _self.department != "all" ) {
                        if( o.departmentName.toLowerCase().indexOf(_self.department.toLowerCase()) == -1 ) {
                            return false;
                        }
                    }

                    if( _self.unit != "all" ) {
                        if( o.unitName.toLowerCase().indexOf(_self.unit.toLowerCase()) == -1 ) {
                            return false;
                        }
                    }

                    return true;
                });
                this.people = filtered;
            },
            sortCol:function(col,dir){
               
                this.colDir[col] = (dir == 'asc' ? 'desc' : 'asc')
                this.directory.people = _.orderBy(this.directory.people,[col],[dir])
                this.people = this.directory.people;
                this.lastColDir = {'col':col,'dir':dir}
            },
            // updateFilter: function (action, filter, value) {
                // if (action == "add") {
                //     if (this[filter].indexOf(value) == -1) {
                //         console.log("added = " + value)
                //         this[filter].push(value)
                //     }
                // }else if(action == "remove"){
                //     if (this[filter].indexOf(value) >= 0) {
                //         console.log("removed = " + value)
                //         this[filter].splice(this[filter].indexOf(value),1)
                //     }
                // }
                // console.log("--------------------")
            // },
            //   addToUnitFilter:function(person){
            //       if(!this.units.includes(person.unitName)){
            //           this.units.push(person.unitName)
            //       }
            //   },
            //   removeFromUnitFilter:function(person){
            //       if(this.units.includes(person.unitName)){
            //         Vue.delete(this.units,this.units.indexOf(person.unitName))
            //       }
            //   },
            //   addToDeptFilter:function(person){
            //       if(!this.departments.includes(person.departmentName)){
            //             this.departments.push(person.departmentName)
            //       }
            //   },
            //   removeFromDeptFilter:function(person){
            //        if(this.departments.includes(person.departmentName)){
            //             Vue.delete(this.departments,this.departments.indexOf(person.departmentName))
            //        }
            //   },
            exeSearch: function (event) {
                this.executeFilter();
                // this.directory.people.forEach(function (person) {
                //     if (person.fullName.toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) {
                //         person.visible = true
                //         // this.updateFilter("add", "units", person.unitName)
                //         // this.updateFilter("add", "departments", person.departmentName)
                //     } else {
                //         person.visible = false
                //         // this.updateFilter("remove", "units", person.unitName)
                //         // this.updateFilter("remove", "departments", person.departmentName)
                //     }
                // }, this)

                // _.filter(this.directory.people, _.bind(function (person, index) {
                //     if (person.fullName.toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) {
                //         console.log('visible')
                //         person.visible = true
                //         // this.addToUnitFilter(person)
                //         // this.addToDeptFilter(person)
                //     } else {
                //         console.log('not visible')
                //         person.visible = false
                //         // this.removeFromUnitFilter(person)
                //         // this.removeFromDeptFilter(person)
                //     }
                // }, this))
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
                // globalPeople = this.directory.people;
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
        cursor:pointer;
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