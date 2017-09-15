<template>
    <div class="frame">
        <div>
            <h3>Add feed source:</h3>
            <form v-on:submit.prevent="addFeedSource">
                <label for="feedName">Source Name</label>
                <input id="feedName" type="text" v-model="newSource.name" value="6abc Action News"><br/>
                <label for="feedUrl">Source URL</label>
                <input id="feedUrl" type="text" v-model="newSource.url" value="http://6abc.com/"><br/>
                <label for="feedFirstFeed">First Feed Url</label>
                <input id="feedFirstFeed" type="text" v-model="newSource.feeds" value="http://6abc.com/feed/">
                <input type="submit" value="Add"/>
            </form>
        </div>
        <div v-if="feedSources && feedSources.length"> 
            <h3>Feed Sources</h3>
            <div v-for="feedSource in feedSources" :key="feedSource['.key']">
                {{ feedSource.name }} <button v-on:click="deleteFeedSource(feedSource['.key'])">x</button>
                <ul v-if="feedSource.feeds">
                    <li v-for="(feed,feedKey) in feedSource.feeds" :key="feedKey">
                        {{ feed.url }}
                        <button v-on:click.prevent="addFeedItems(feedSource['.key'],feed.url)">process</button>
                        <button v-on:click.prevent="deleteFeedItems(feedSource['.key'],feed.url)">x items</button>
                        <button v-on:click.prevent="deleteFeed(feedSource['.key'],feedKey)">x feed</button>
                    </li>
                </ul>
            </div>
            <h3>Add Feed to Source</h3>
            <select v-model="selectedSource">
                <option disabled value="">Select Source</option>
                <option v-for="feedSource in feedSources" :key="feedSource['.key']" :value="feedSource['.key']">{{ feedSource.name }}</option>
            </select>
            <input type="text" placeholder="Feed Url"  v-model="newFeedUrl" @keyup.enter="addFeedToSource"><button v-on:click="addFeedToSource">Add</button>
        </div>
        <!-- <div v-if="feeds && feeds.length">
            <div v-for="(item, index) in feeds" v-bind:key="index" class="feed-item">
                <div class="item-score"></div>
                <div class="item-title">{{ item.title._text }} <small>( <a :href="item.sourceLink">{{ item.sourceName }}</a> ) - {{ item.niceDate }}</small></div>
                <p class="item-desc">{{ item.description._text }} <a v-bind:href="item.link._text" class="item-link" target="_blank"> read more &raquo;</a></p>
            </div>
        </div> -->
        <!-- <div v-if="feeds">
            <div v-for="(feed,index) in feeds" v-bind:key="index">
                <div v-for="item in feed" :key="item['.key']"  class="feed-item">
                    <div class="item-title">{{ item.title }}</div>
                    <p class="item-desc">{{ item.desc }} 
                        <a v-bind:href="item.url" class="item-link" target="_blank"> read more &raquo;</a>
                    </p>
                </div>
            </div>
        </div> -->
    </div>  
</template>

<script>

import axios from 'axios'
import convert from 'xml-js'
import _ from 'lodash'
import moment from 'moment'
import firebase from 'firebase'
import s from 'voca'

var config = {
    apiKey: "AIzaSyDlmkdwCAyUo09nueh20qqqZrYYdbMF0R0",
    authDomain: "phillynews-3e3f2.firebaseapp.com",
    databaseURL: "https://phillynews-3e3f2.firebaseio.com",
    projectId: "phillynews-3e3f2",
    storageBucket: "phillynews-3e3f2.appspot.com",
    messagingSenderId: "1090015144815"
};

var app = firebase.initializeApp(config);
var db = app.database()
var feedSourcesRef = db.ref('feedSources')

var feedsRef = db.ref('feeds')

var queryTodaysFeed = db.ref('feeds').orderByChild('pubDate')

queryTodaysFeed.on('child_added',function(snap){
    var feed = snap.val();
    console.log(feed);
})

export default {
  name: 'app',
  data () {
    return {
        selectedSource:'',
        newFeedUrl:'',
        newSource: {
            name: '',
            url: '',
            feed: ''
        },
        newFeed:{
            url: '',
            sourceId: ''
        },
        sources: [
            {
                name : 'Philadelphia Voice',
                url : 'http://philadelphiavoice.com',
                feeds : [
                    'http://www.phillyvoice.com/feed/channel/philadelphia-news/'
                ]
            },
            {
                name: "Philly.com",
                url: "http://www.philly.com",
                feeds: [
                    'http://www.philly.com/philly_news.rss'
                ]
            },
            {
                name: "NewsWorks",
                url: "http://www.newsworks.org",
                feeds: [
                    'http://feeds.feedburner.com/newsworks/MoreNews?format=xml'
                ]
            }
        ],
        // feeds: [],
        errors: [],
     }
  },
  firebase:function(){
      return{
          feeds:feedsRef,
          feedSources: feedSourcesRef
      }
  },
  created(){

    //   var that = this;
    //   var promises = [];

    //   _.each(that.sources,function(source){
    //       _.each(source.feeds,function(feed){
    //           promises.push(axios.get(feed));
    //       });
    //   });
    //   axios.all(promises).then(function(results){
    //       results.forEach(function(result,index){
    //           var feed = convert.xml2js(result.data, {compact:true,spaces:4});
    //           var feedSourceName = that.sources[index].name;
    //           var feedSourceLink = that.sources[index].url;
    //           var feed_items = feed.rss.channel.item;
    //           feed_items.forEach(function(item,index){
    //               item.pubDate = item.pubDate._text;
    //               item.niceDate = moment(item.pubDate).format('MM-DD-YY');
    //               item.sourceLink = feedSourceLink;
    //               item.sourceName = feedSourceName;
    //               that.feeds.push(item);
    //           });
    //       });
    //       that.feeds.sort(function(a,b){
    //           return new Date(b.pubDate) - new Date(a.pubDate);
    //       });
    //   });
  },
  computed:{
  },
  methods:{
      addFeedSource: function(e){
         var sourceSlug =  s.slugify(this.newSource.name)
         feedSourcesRef.child(sourceSlug).set({
             name : this.newSource.name,
             url : this.newSource.url,
         })

         feedSourcesRef.child(sourceSlug + "/feeds").push({
             url : this.newSource.feeds
         })

         this.addFeedItems(sourceSlug,this.newSource.feeds)

         this.newSource.name = ''
         this.newSource.url = ''
         this.newSource.feeds = ''

      },
      addFeedToSource: function(){
          feedSourcesRef.child(this.selectedSource + "/feeds").push({
              url : this.newFeedUrl
          })
          this.addFeedItems(this.selectedSource,this.newFeedUrl)
      },
      addFeedItems: function(sourceSlug,feedUrl){
          if(sourceSlug && feedUrl){
              axios.get(feedUrl).then(response => {
                  var feed = convert.xml2js(response.data, {compact:true,spaces:4});
                  var feed_items = feed.rss.channel.item;
                  if(feed_items && feed_items.length){
                      feed_items.forEach(function(item,index){
                          feedsRef.child(sourceSlug).push({
                              pubDate: moment(item.pubDate._text).format(),
                              title : item.title._text,
                              desc : item.description._text,
                              url : item.link._text
                          })
                     })
                  }
              })
          }
      },
      deleteFeedItems: function(sourceSlug){
          feedsRef.child(sourceSlug).remove()
      },
      deleteFeed: function(sourceSlug,feedKey){
          this.deleteFeedItems(sourceSlug);
          feedSourcesRef.child(sourceSlug + "/feeds/" + feedKey).remove()
      },
      deleteFeedSource: function(sourceSlug){
          this.deleteFeedItems(sourceSlug);
          feedSourcesRef.child(sourceSlug).remove();
      }
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
        max-width: 500px;
        margin:0 auto;
    }
    .feed-item{
        margin:0 auto 5px;
        background-color:#f7fcff;
        border-radius:6px;
        border:1px solid #dfe7ec;
        padding:10px 20px;
    }
    .item-title{
        font-weight:700;
    }
    .item-desc{
        font-weight:400;
        color:#4c4c4c;
    }
    a{
        text-decoration:none;
    }
</style>