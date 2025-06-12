
      <p>
        <h3>Issue #: 26</h3>
        </strong><h2>Description</h2>
<p>This is a Page that Logs the user in.</p>
<h2>Behavior / Flow</h2>
<ol>
<li>Load EventTypes.</li>
<li>User enters email address and password.</li>
<li>loginRequest is sent to server using execEvent('userLogin')</li>
</ol>
<p><strong>Successfully logged in:</strong></p>
<ol>
<li>receive pertinent user data from Server.</li>
<li>Set User variables</li>
<li>Load account the user has access to using execEvent('userAcctList')</li>
<li>Call the <strong>accountStore</strong> to load all the semi-static lists for the account.5. Navigate to the Welcome page.</li>
<li>PageHeader renders a Select widget with the userAccounts</li>
</ol>
<h2>Acceptance Criteria</h2>
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" id="" disabled="" class="task-list-item-checkbox"> PageHeader Select Account widget is populated.</li>
</ul>
<h2>Related Components</h2>
<ul>
<li>src\pages\Login.js</li>
<li>src\stores\accountStore.js</li>
<li>src\stores\eventStore.js</li>
<li>src\pages\PageHeader.js</li>
</ul>
        <strong>Comments:</strong><br>
        <ul></ul><br>
      </p>
    