<template>
    <div>
        <div id="search">
            <input type="text" placeholder="search directory" v-on:keyup="search">
            <div class="table">
                <div class="tr">
                    <div class="td">id</div>
                    <div class="td">Name</div>
                    <div class="td">Email</div>
                    <div class="td">
                        <select v-model="deptFilter">
                            <option disabled>Departments</option>
                            <option value="">All Departments</option>
                            <option v-for="(department,index) in departments" v-bind:key="index" v-bind:value="department">{{ department }}</option>
                        </select>
                    </div>
                    <div class="td">
                        <select v-model="unitFilter">
                            <option disabled selected>Units</option>
                            <option>All Units</option>
                            <option v-for="(unit,index) in units" v-bind:key="index" v-bind:value="unit">{{ unit }}</option>
                        </select>
                    </div>
                </div>
                <div v-for="(person,key) in searchResults" v-bind:key="person.id" class="tr" v-show="person.visible">
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
  data () {
    return {
        location: '',
        searchResults:[],
        directory: [],
        units:[],
        departments:[],
        people:[],
        errors: [],
        unitFilter:'',
        deptFilter:'',
     }
  },
  created(){
      axios.get('/src/assets/sample-data.json')
      .then(response => {
          this.directory = response.data
          this.getDeptLocations()
          this.getPersonDept()
      }).catch(e => {
          this.errors.push(e);
      });
  },
  watch: {
      unitFilter:function(){
          _.filter(this.searchResults,_.bind(function(person){
              if(person.unitName == this.unitFilter){
                  console.log(this.unitFilter)
                  if(this.unitFilter == "all"){
                      person.visible = false;
                  }else{
                      person.visible = true
                  this.searchResults = Object.assign({},this.searchResults,{
                      [person.pId] : person
                })
                this.updateFilters("add",person);
                  }
              }else{
                  person.visible = false
                  this.searchResults = Object.assign({},this.searchResults,{
                      [person.pId] : person
                })
                this.updateFilters("remove",person);
              }
          },this))
      },
      deptFilter:function(){
          _.filter(this.searchResults,_.bind(function(person){
              if(person.departmentName == this.deptFilter){
                  person.visible = true
                  this.searchResults = Object.assign({},this.searchResults,{
                      [person.pId] : person
                })
                this.updateFilters("add",person);
              }else{
                  person.visible = false
                  this.searchResults = Object.assign({},this.searchResults,{
                      [person.pId] : person
                })
                this.updateFilters("remove",person);
              }
          },this))
      }
  },
  methods:{
      updateFilters:function(action,person){
          if(action == 'add'){
              this.addToUnitFilter(person)
              this.addToDeptFilter(person)
          }else if(action == 'remove'){
              this.removeFromUnitFilter(person)
              this.removeFromDeptFilter(person)
          }
      },
      addToUnitFilter:function(person){
          if(!this.units.includes(person.unitName)){
              this.units.push(person.unitName)
          }
      },
      removeFromUnitFilter:function(person){
          if(this.units.includes(person.unitName)){
            Vue.delete(this.units,this.units.indexOf(person.unitName))
          }
      },
      addToDeptFilter:function(person){
          if(!this.departments.includes(person.departmentName)){
                this.departments.push(person.departmentName)
          }
      },
      removeFromDeptFilter:function(person){
           if(this.departments.includes(person.departmentName)){
                Vue.delete(this.departments,this.departments.indexOf(person.departmentName))
           }
      },
      search:function(event){
        _.filter(this.directory.people,_.bind(function(person,index){
            let pId = 'p-' + person.id
            if(person.fullName.toLowerCase().indexOf(event.target.value.toLowerCase())>=0){
                person.pId = pId
                person.visible = true
                this.searchResults = Object.assign({},this.searchResults,{
                    [pId] : person
                })
                this.addToUnitFilter(person)
                this.addToDeptFilter(person)
                 
            }else{
                if(pId in this.searchResults){
                    Vue.delete(this.searchResults,pId)
                }
                this.removeFromUnitFilter(person)
                this.removeFromDeptFilter(person)   
            }
        },this))
      },
      getPersonDept:function(){
          var self = this;
           this.directory.people.forEach(function(person){
               person.fullName = person.first + " " + person.last
              _.find(self.directory.departments, function(dept){
                 if(dept.id == person.department){
                     person.departmentName = dept.name
                     _.find(dept.units,function(unit){
                         if(person.unit == unit.id){
                             person.unitName = unit.name
                         }
                     })
                 }
              })
          })
      },
      getDeptLocations: function(){
          var self = this;
          this.directory.departments.forEach(function(department){
              _.find(self.directory.locations, function(o){
                 if(o.locationId == department.location){
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

    html{
       
    }
    body{
        background-color:#fdfdfd;
        font-family: 'Lato',sans-serif;
        font-size:14px;
        color:#333;
        a{
            color:#f19e06;
        }
    }
    .frame{
        width:100%;
        max-width: 960px;
        margin:0 auto;
    }
    a{
        text-decoration:none;
    }
    .table{
        display: table;
        width:100%;
        .tr{
            display:table-row;
            &:nth-child(odd){
                background-color:#efefef;
            }
        }
        .td{
            display: table-cell;
            padding:5px;
        }
    }

    input[type="text"]{
        margin-bottom:10px;
        border:1px solid #ececec;
        height: 30px;
        padding-left:5px;
    }
</style>