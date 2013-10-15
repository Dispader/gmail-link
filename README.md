This is a scratch project to attempt to extract a reliable HTML href link to Google Mail messages.

Motivation
----------

The Todoist application previously created a text entity capable of opening an individual Google Mail message, for the purposes of including that message in the text body of a task.  This Google Mail reference was further capable of linking to any Google Mail domain account (e.g.: jake@umn.edu) when another Google Mail domain (e.g.: jake.gage@gmail.com) was used as an authenticating service for Todoist.

This behavior was highly useful and desirable, as it allowed for linking a task to a Google Mail conversation thread for later processing or clairification of the task.  This could be accomplished by authenticating Todoist to the domain of a source email to be linked (e.g.: jake@umn.edu), using the Todoist Chrome plugin to generate the text entity, and copying this enitity to any Todoist account (e.g.: jake.gage@gmail.com).

The added step of authenticating to the Todoist account domain for the source email address was undesirable, but not an undue burden.

This behavior has changed in Todoist.  Todoist now creates a non-text DOM entity, which may not be copied through standard means.  This seems to effectively disable the process for attaching an email in a Google Mail domain which differs from the Google Mail domain used to authenticate the Todoist Chrome plugin.

Link Formatting
---------------

This is a sample same-domain email link generated by Todoist:

https://mail.google.com/mail/u/0/#inbox/140d656b8e54d660

- works for Todoist authenticated in the same Google domain
- returns "The conversation that you requested no longer exists" for a browser session authenticated in another domain

This is a sample of an email link generated by Todoist from a different authentication domain:

https://mail.google.com/a/umn.edu/#inbox/13f62a30179692eb

Todoist task list item formatting
---------------------------------

This is the inner most HTML hyperlink from a functioning cross-domain Todoist task:

<pre>
&lt;a onclick="return linkRedirecter(this)" target="_blank" class="ex_link" href="https://mail.google.com/a/umn.edu/#inbox/13f62a30179692eb"&gt;Web Migrations for this weekend&lt;/a&gt;
</pre>

The link includes the Google domain, and fucntions in both domain-authenticated environments.

This is the complete HTML list item from a fucntioning cross-domain Todoist task:

<pre>
&lt;li class="task_item history_item item_110881999 indent_1" id="item_110881999"&gt;
  &lt;table&gt;
    &lt;tbody&gt;
      &lt;tr&gt;
        &lt;td&gt;
          &lt;div class="div_checker"&gt;
            &lt;div class="amicheckbox"&gt;&lt;img width="16" height="16" src="https://d3ptyyxy2at9ui.cloudfront.net/76084e29cb2cf72b320e888edc583dfb.gif" class="cmp_14_checkbox_on amicheckbox_img"&gt;&lt;/div&gt;
          &lt;/div&gt;
        &lt;/td&gt;
        &lt;td class="content"&gt;
          &lt;span class="date empty"&gt;&lt;/span&gt;&lt;span&gt;send Douglas a summary of your &lt;img width="16" class="cmp_email_on" src="https://d3ptyyxy2at9ui.cloudfront.net/76084e29cb2cf72b320e888edc583dfb.gif"&gt; &lt;a onclick="return linkRedirecter(this)" target="_blank" class="ex_link" href="https://mail.google.com/a/umn.edu/#inbox/13f62a30179692eb"&gt;Web Migrations for this weekend&lt;/a&gt;&lt;span class="clickable note_icon" style="visibility: hidden;"&gt;&lt;img width="15" height="14" src="https://d3ptyyxy2at9ui.cloudfront.net/76084e29cb2cf72b320e888edc583dfb.gif" class="cmp_note clickable"&gt;&lt;/span&gt;&lt;/span&gt;
          &lt;div&gt;&lt;/div&gt;
        &lt;/td&gt;
      &lt;/tr&gt;
    &lt;/tbody&gt;
  &lt;/table&gt;
&lt;/li&gt;
</pre>

Link formatting
---------------

This is the extracted URL from a functioning link:

<pre>
https://mail.google.com/a/umn.edu/#inbox/13f62a30179692eb
</pre>

This is the RESTful-style URL from the location line of a Google Mail thread:

<pre>
https://mail.google.com/mail/ca/u/0/#inbox/141b796e773c4f19
</pre>


TODO
----

Extract the relevant JavaScript which senses Google Mail item.

- suspicion: URL analysis of the HTTP requested