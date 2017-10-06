# jm-ecs

entity component system

# E

entity

# C

component

# EM

entity manager

## ECS

entity component system

a system include some entity manager
所有的Compoent、Factory、Processor均注册到EntityManager的实例例如em中，
所有实体均由em生成、管理和销毁，并且从属于此em

## using

- ES6

```javascript
import ECS from 'jm-ecs';
let ecs = new ECS();
let em = ecs.em();
let e = em.e();
e.use('component');

```
