/* global Packages */

//	---------------------------------------------------------------------------
//	jWebSocket MongoDBUtils for Script Apps (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2015 Innotrade GmbH (jWebSocket.org)
//	Alexander Schulze, Germany (NRW)
//	
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//	---------------------------------------------------------------------------

MongoDBUtils = {
    
    /**
     * Converts an JSON object to DBObject
     * 
     * @param {Object} aObject
     * @returns {Packages.com.mongodb.BasicDBObject|MongoDBUtils.toDBObject.lDBObject}
     */
    toDBObject: function (aObject) {
        var lDBObject = new Packages.com.mongodb.BasicDBObject();
        for (var lAttr in aObject) {
            lDBObject.append(lAttr, aObject[lAttr]);
        }

        return lDBObject;
    },
    /**
     * Converts a String value to ObjectId
     * 
     * @param {String} aStrId
     * @returns {Packages.org.bson.types.ObjectId}
     */
    toId: function (aStrId) {
        return new Packages.org.bson.types.ObjectId(aStrId)
    },
    /**
     * Converts a DBCursor object to JavaScript Array
     * 
     * @param {DBCursor} aDBCursor
     * @returns {Array|MongoDBUtils.toArray.lArray}
     */
    toArray: function (aDBCursor) {
        var lArray = []
        while (aDBCursor.hasNext()) {
            lArray.push(aDBCursor.next().toMap());
        }

        return lArray;
    }
}