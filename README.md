# OneDimensionNavigation/AnimationPane
Sense Extension-One Dimension Navigation/animation Panel

This is a Qlik sense extension which enables navigation/autoplay along selected field-original or calculated.

![alt text](http://g.recordit.co/IvMX9tPYa4.gif)


The sole purpose of this extension is to simplify the process of selecting certain field in sequence.

When I do data expoloration, often I got annoyed by Qlik's selection mechanism. For example, to browse through monthly report for a year, I will have to create a month table and click every single column in sequence. I hate it especially when I click on the wrong column and it has interrupted my thinking uncountable times. 
Maybe there is clever walkaround on this issue but I couldnt find it online. So I build this extension to help myself, and people suffering in similar situation.

It is a simple extension. There are 4 buttons:

Clear- Clear all selection

Reset- Reset the index to the first element

Prev- Move to last element

Next- Move to next element

Start- Start animation. Think about this as automated selection along our dimension, with fixed time interval. All the chart on the sheet will start transforming together.

Update:
Solve sorting issue, replace field manipulation with hypercube manipulation.
UI change thanks to murraygm
