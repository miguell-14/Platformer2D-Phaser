<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.12.2" name="Tileset" tilewidth="16" tileheight="16" tilecount="60" columns="10">
 <image source="../assets/images/tiles/Tileset.png" width="160" height="96"/>
 <tile id="1">
  <properties>
   <property name="collides" type="bool" value="true"/>
  </properties>
 </tile>
 <tile id="3">
  <properties>
   <property name="collides" type="bool" value="true"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="2" x="0" y="0" width="16" height="16"/>
  </objectgroup>
 </tile>
 <tile id="11">
  <properties>
   <property name="collides" type="bool" value="true"/>
  </properties>
 </tile>
 <tile id="13">
  <properties>
   <property name="collides" type="bool" value="true"/>
  </properties>
 </tile>
 <tile id="23">
  <properties>
   <property name="collides" type="bool" value="true"/>
  </properties>
 </tile>
 <tile id="26">
  <properties>
   <property name="oneWay" type="bool" value="true"/>
  </properties>
 </tile>
 <tile id="27">
  <properties>
   <property name="oneWay" type="bool" value="false"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="0" y="0" width="16" height="10"/>
   <object id="2" x="0" y="0" width="16" height="10"/>
   <object id="3" x="0" y="0" width="16" height="10">
    <properties>
     <property name="collides" type="bool" value="true"/>
    </properties>
   </object>
  </objectgroup>
 </tile>
 <tile id="28">
  <properties>
   <property name="oneWay" type="bool" value="false"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="-0.0846633" y="0.0423316" width="16" height="10">
    <properties>
     <property name="collides" type="bool" value="true"/>
    </properties>
   </object>
  </objectgroup>
 </tile>
 <tile id="29">
  <properties>
   <property name="oneWay" type="bool" value="true"/>
  </properties>
 </tile>
 <tile id="47">
  <properties>
   <property name="collides" type="bool" value="true"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="0" y="0" width="16" height="13">
    <properties>
     <property name="collides" type="bool" value="true"/>
    </properties>
   </object>
  </objectgroup>
 </tile>
</tileset>
